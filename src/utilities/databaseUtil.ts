import { Connection } from './../model/Connection';
import * as vscode from 'vscode';
import * as mysql from 'mysql2';
import * as mysqlPromise from 'mysql2/promise';
import * as wanakana from 'wanakana';
import { toRomaji as toRomajiCustom } from './japaneseUtil';
// const Kuroshiro = require("kuroshiro");
// const KuromojiAnalyzer = require("kuroshiro-analyzer-kuromoji");
// const kuroshiro = new Kuroshiro();

export async function testConnection(connection: Connection, context: vscode.ExtensionContext) {
    switch (connection.databaseDriver) {
        case 'mysql':
            await mysqlTestConnection(connection, context);
            break;

        default:
            vscode.window.showErrorMessage(`sorry we do not support ${connection.databaseDriver} database driver yet!`);
            break;
    }
}

export async function queryKeyword(connection: Connection, context: vscode.ExtensionContext, keyword: string) {
    switch (connection.databaseDriver) {
        case 'mysql':
            return await keywordSearchMySQL(connection, context, keyword);

        default:
            vscode.window.showErrorMessage(`sorry we do not support ${connection.databaseDriver} database driver yet!`);
            return null;
    }
}

async function mysqlTestConnection(connection: Connection, context: vscode.ExtensionContext) {
    const testConnection = await mysql.createConnection({
        host: connection.host,
        port: connection.port,
        user: connection.username,
        password: connection.password,
        database: connection.database
    });

    await testConnection.connect(err => {
        if (err) {
            vscode.window.showErrorMessage('Connection failed: ' + err.message);
            return;
        }
        vscode.window.showInformationMessage('Connected successfully!');
    })
}

async function keywordSearchMySQL(connection: Connection, context: vscode.ExtensionContext, keyword: string) {
    const keywordConnection = await mysqlPromise.createConnection({
        host: connection.host,
        port: connection.port,
        user: connection.username,
        password: connection.password,
        database: connection.database
    });
    // console.log(keyword);

    // check keyword is japanese
    if (wanakana.isJapanese(keyword)) {
        // await kuroshiro.init(new KuromojiAnalyzer());
        // keyword = await kuroshiro.convert(keyword, {to: "romaji"});
        // console.log("=============================");
        // console.log(keyword);
        keyword = await toRomajiCustom(keyword);
        if (!keyword) vscode.window.showErrorMessage("Có lỗi xảy ra!");
    }

    // chuẩn hóa data (tìm kiếm theo quy tắc lỏng lẻo hơn)
    keyword = keyword.replace('_', '').replace(/[^\w\s]/gi, '').toLowerCase();
    // console.log(keyword);

    const [rows, fields] = await keywordConnection.execute(`SELECT TABLE_SCHEMA,TABLE_NAME,COLUMN_NAME,COLUMN_DEFAULT,IS_NULLABLE,DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? and lower(replace(COLUMN_NAME, '_', '')) like ?;`, [connection.database, '%' + keyword + '%']);

    const [tableRows, tableFields] = await keywordConnection.execute(`SELECT TABLE_SCHEMA,TABLE_NAME,TABLE_TYPE,TABLE_ROWS,TABLE_COMMENT FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ? and lower(replace(TABLE_NAME, '_', '')) like ?;`, [connection.database, '%' + keyword + '%']);

    const [procedureRows, procedureFields] = await keywordConnection.execute(`SELECT ROUTINE_SCHEMA,ROUTINE_NAME,ROUTINE_DEFINITION FROM INFORMATION_SCHEMA.ROUTINES WHERE ROUTINE_SCHEMA = ? and ROUTINE_TYPE = ? and lower(replace(ROUTINE_NAME, '_', '')) like ?;`, [connection.database, 'PROCEDURE', '%' + keyword + '%']);

    const [functionRows, functionFields] = await keywordConnection.execute(`SELECT ROUTINE_SCHEMA,ROUTINE_NAME,ROUTINE_DEFINITION FROM INFORMATION_SCHEMA.ROUTINES WHERE ROUTINE_SCHEMA = ? and ROUTINE_TYPE = ? and lower(replace(ROUTINE_NAME, '_', '')) like ?;`, [connection.database, 'FUNCTION', '%' + keyword + '%']);

    const [triggerRows, triggerFields] = await keywordConnection.execute(`SELECT TRIGGER_SCHEMA,TRIGGER_NAME,EVENT_MANIPULATION,ACTION_STATEMENT FROM INFORMATION_SCHEMA.TRIGGERS WHERE TRIGGER_SCHEMA = ? and lower(replace(TRIGGER_NAME, '_', '')) like ?;`, [connection.database, '%' + keyword + '%']);

    return {
        columns: rows,
        tables: tableRows,
        procedures: procedureRows,
        functions: functionRows,
        triggers: triggerRows,
    };
}