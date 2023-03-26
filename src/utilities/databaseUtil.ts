import { Connection } from './../model/Connection';
import * as vscode from 'vscode';
import * as mysql from 'mysql2';
import * as mysqlPromise from 'mysql2/promise';
import * as wanakana from 'wanakana';
import Kuroshiro from 'kuroshiro';
import KuromojiAnalyzer from 'kuroshiro-analyzer-kuromoji';
import postgres from 'postgres';

export async function testConnection(connection: Connection, context: vscode.ExtensionContext) {
    switch (connection.databaseDriver) {
        case 'mysql':
            await mysqlTestConnection(connection, context);
            break;
        case 'postgresql':
            await postgreTestConnection(connection, context);
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
        case 'postgresql':
            return await keywordSearchPostgreSQL(connection, context, keyword);
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

async function postgreTestConnection(connection: Connection, context: vscode.ExtensionContext) {
    const sql = postgres({
        host: connection.host,
        port: connection.port,
        database: connection.database,
        username: connection.username,
        password: connection.password,
    });
    try {
        await sql`SELECT 1`;
        vscode.window.showInformationMessage('Connected successfully!');
        return;
    } catch (error) {
        console.log(error);
        vscode.window.showErrorMessage('Connection failed');
    }
}

async function keywordSearchMySQL(connection: Connection, context: vscode.ExtensionContext, keyword: string) {
    const keywordConnection = await mysqlPromise.createConnection({
        host: connection.host,
        port: connection.port,
        user: connection.username,
        password: connection.password,
        database: connection.database
    });

    // check keyword is japanese
    if (wanakana.isJapanese(keyword)) {
        const kuroshiro = new Kuroshiro();
        await kuroshiro.init(new KuromojiAnalyzer());
        keyword = await kuroshiro.convert(keyword, {to:"romaji",mode:"normal",romajiSystem:"passport"});
        if (!keyword) vscode.window.showErrorMessage("Có lỗi xảy ra!");
    }

    // chuẩn hóa data (tìm kiếm theo quy tắc lỏng lẻo hơn)
    keyword = keyword.replace('_', '').replace(/[^\w\s]/gi, '').toLowerCase();
    // console.log(keyword);

    const [rows, fields] = await keywordConnection.execute(`SELECT TABLE_SCHEMA,TABLE_NAME,COLUMN_NAME,COLUMN_DEFAULT,IS_NULLABLE,DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? and lower(replace(COLUMN_NAME, '_', '')) like ? order by LOCATE(?, lower(replace(COLUMN_NAME, '_', '')));`, [connection.database, '%' + keyword + '%', keyword]);

    const [tableRows, tableFields] = await keywordConnection.execute(`SELECT TABLE_SCHEMA,TABLE_NAME,TABLE_TYPE,TABLE_ROWS,TABLE_COMMENT FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ? and lower(replace(TABLE_NAME, '_', '')) like ? order by LOCATE(?, lower(replace(TABLE_NAME, '_', '')));`, [connection.database, '%' + keyword + '%', keyword]);

    const [procedureRows, procedureFields] = await keywordConnection.execute(`SELECT ROUTINE_SCHEMA,ROUTINE_NAME,ROUTINE_DEFINITION FROM INFORMATION_SCHEMA.ROUTINES WHERE ROUTINE_SCHEMA = ? and ROUTINE_TYPE = ? and lower(replace(ROUTINE_NAME, '_', '')) like ? order by LOCATE(?, lower(replace(ROUTINE_NAME, '_', '')));`, [connection.database, 'PROCEDURE', '%' + keyword + '%', keyword]);

    const [functionRows, functionFields] = await keywordConnection.execute(`SELECT ROUTINE_SCHEMA,ROUTINE_NAME,ROUTINE_DEFINITION FROM INFORMATION_SCHEMA.ROUTINES WHERE ROUTINE_SCHEMA = ? and ROUTINE_TYPE = ? and lower(replace(ROUTINE_NAME, '_', '')) like ? order by LOCATE(?, lower(replace(ROUTINE_NAME, '_', '')));`, [connection.database, 'FUNCTION', '%' + keyword + '%', keyword]);

    const [triggerRows, triggerFields] = await keywordConnection.execute(`SELECT TRIGGER_SCHEMA,TRIGGER_NAME,EVENT_MANIPULATION,ACTION_STATEMENT FROM INFORMATION_SCHEMA.TRIGGERS WHERE TRIGGER_SCHEMA = ? and lower(replace(TRIGGER_NAME, '_', '')) like ? order by LOCATE(?, lower(replace(TRIGGER_NAME, '_', '')));`, [connection.database, '%' + keyword + '%', keyword]);

    return {
        columns: rows,
        tables: tableRows,
        procedures: procedureRows,
        functions: functionRows,
        triggers: triggerRows,
    };
}

async function keywordSearchPostgreSQL(connection: Connection, context: vscode.ExtensionContext, keyword: string) {
    const sql = postgres({
        host: connection.host,
        port: connection.port,
        database: connection.database,
        username: connection.username,
        password: connection.password,
    });
    // check keyword is japanese
    if (wanakana.isJapanese(keyword)) {
        const kuroshiro = new Kuroshiro();
        await kuroshiro.init(new KuromojiAnalyzer());
        keyword = await kuroshiro.convert(keyword, {to:"romaji",mode:"normal",romajiSystem:"passport"});
        if (!keyword) vscode.window.showErrorMessage("Có lỗi xảy ra!");
    }

    // chuẩn hóa data (tìm kiếm theo quy tắc lỏng lẻo hơn)
    keyword = keyword.replace('_', '').replace(/[^\w\s]/gi, '').toLowerCase();
    // console.log(keyword);

    const rows = await sql`select table_catalog,table_name,column_name,column_default,is_nullable,data_type from information_schema."columns" c 
    where c.table_catalog like ${connection.database} and lower(replace(c.column_name, '_', '')) like ${'%' + keyword + '%'}
    order by POSITION(${keyword} in lower(replace(c.column_name, '_', '')));`

    const tableRows = await sql`select table_catalog,table_schema,table_name,table_type from information_schema."tables" t 
    where t.table_catalog like ${connection.database} and lower(replace(t.table_name , '_', '')) like ${'%' + keyword + '%'}
    order by POSITION(${keyword} in lower(replace(t.table_name, '_', '')));`;

    const procedureRows = await sql`select specific_catalog,specific_schema,specific_name,routine_catalog,routine_schema,routine_name,routine_definition from information_schema."routines" r 
    where r.specific_catalog like ${connection.database} and r.routine_type = 'PROCEDURE' and lower(replace(r.routine_name , '_', '')) like ${'%' + keyword + '%'}
    order by POSITION(${keyword} in lower(replace(r.routine_name, '_', '')));
    `;

    const functionRows = await sql`select specific_catalog,specific_schema,specific_name,routine_catalog,routine_schema,routine_name,routine_definition from information_schema."routines" r 
    where r.specific_catalog like ${connection.database} and r.routine_type = 'FUNCTION' and lower(replace(r.routine_name , '_', '')) like ${'%' + keyword + '%'}
    order by POSITION(${keyword} in lower(replace(r.routine_name, '_', '')));`;

    const triggerRows = await sql`select trigger_catalog,trigger_schema,trigger_name,event_manipulation,event_object_catalog,event_object_schema,event_object_table,action_statement,action_orientation,action_timing from information_schema.triggers t
    where t.trigger_catalog like ${connection.database} and lower(replace(t.trigger_name , '_', '')) like ${'%' + keyword + '%'}
    order by POSITION(${keyword} in lower(replace(t.trigger_name, '_', '')));`

    return {
        columns: rows,
        tables: tableRows,
        procedures: procedureRows,
        functions: functionRows,
        triggers: triggerRows,
    };
}