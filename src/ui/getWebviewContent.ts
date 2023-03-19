import { Connection } from './../model/Connection';
import { ExtensionContext, window } from "vscode";
import { Webview, Uri } from "vscode";
import { getUri } from "../utilities/getUri";
import { getNonce } from "../utilities/getNonce";

import * as fs from 'fs';
/**
 * Defines and returns the HTML that should be rendered within a notepad note view (aka webview panel).
 *
 * @param webview A reference to the extension webview
 * @param extensionUri The URI of the directory containing the extension
 * @param note An object representing a notepad note
 * @returns A template string literal containing the HTML that should be
 * rendered within the webview panel
 */
export function getConnectionDetailWebviewContent(webview: Webview, context: ExtensionContext, connection: Connection) {
  const webviewUri = getUri(webview, context.extensionUri, ["out", "webview.js"]);
  const styleUri = getUri(webview, context.extensionUri, ["out", "style.css"]);
  const boostrapGrid = getUri(webview, context.extensionUri, ["out", "bootstrap-grid.min.css"]);
  const codiconUri = getUri(webview, context.extensionUri, ["out", "codicon.css"]);
  const nonce = getNonce();
  // let htmlContent = fs.readFileSync(context.asAbsolutePath('resources/html/connection-manager.html'), 'utf8');

  webview.onDidReceiveMessage((message) => {
    const command = message.command;
    switch (command) {
      case "requestConnectionData":
        webview.postMessage({
          command: "receiveDataInConnectionDetailWebview",
          payload: JSON.stringify(connection),
        });
        break;
    }
  });

  let isActive = connection.isActive ? 'checked' : '';

  let mysqlChecked = '';
  let postgresqlChecked = '';
  let mariadbChecked = '';
  switch (connection.databaseDriver) {
    case 'mysql':
      mysqlChecked = 'selected';
      break;
    case 'postgresql':
      postgresqlChecked = 'selected';
      break;
    case 'mariadb':
      mariadbChecked = 'selected';
      break;
    default:
      break;
  }


  return `<!DOCTYPE html>
  <html lang="en">
  
  <head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Content-Security-Policy"
      content="default-src 'none'; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';">
    <link rel="stylesheet" href="${styleUri}">
    <link rel="stylesheet" href="${codiconUri}">
    <link rel="stylesheet" href="${boostrapGrid}">
    <title>Document</title>
  </head>
  
  <body>
    <h1>Connection Detail</h1>
    <br>
    <br>
    <!-- Indicates that the divider semantically separates content -->
    <vscode-divider style="margin-top: 20px; margin-bottom: 20px;" role="separator"></vscode-divider>
    <div class="container">
      <div class="row">
        <h3 class="text-center">${connection.connectionName}</h3>
        <div class="row">
          <div class="col-md-8">
            <vscode-text-field class="full" id="connection-name-id" value="${connection.connectionName}" placeholder="Name of connection">Connection
              name</vscode-text-field>
          </div>
          <div class="col-md-4">
            <label for="database-driver-id">Database driver:</label>
          <vscode-dropdown class="full" id="database-driver-id">
            <vscode-option ${mysqlChecked}>MySQL</vscode-option>
            <vscode-option ${postgresqlChecked}>PostgreSQL</vscode-option>
            <vscode-option ${mariadbChecked}>MariaDB</vscode-option>
          </vscode-dropdown>
          </div>
          <br>
        </div>
        <div class="row">
          <div class="col-md-8">
            <vscode-text-field class="full" id="host-name-id" value="${connection.host}" placeholder="Database host">Host</vscode-text-field>
          </div>
          <div class="col-md-4">
            <vscode-text-field class="full" id="port-id" value="${connection.port}" placeholder="Port">Port</vscode-text-field>
          </div>
          <br>
        </div>
        <div class="row">
          <div class="col-md-4">
            <vscode-text-field class="full" id="username-id" value="${connection.username}" placeholder="Username">Username</vscode-text-field>
          </div>
          <div class="col-md-4">
            <vscode-text-field class="full" type="password" id="password-id" value="${connection.password}" placeholder="Password">Password</vscode-text-field>
          </div>
          <div class="col-md-4">
            <vscode-text-field class="full" id="database-id" value="${connection.database}" placeholder="Database">Database</vscode-text-field>
          </div>
          <div class="col-md-3" style="padding-top: 20px;">
            <vscode-checkbox class="full" ${isActive} id="is-active-id">Active connection</vscode-checkbox>
          </div>
          <br>
        </div>
        <div class="row">
          <div class="col-md-4">
            <vscode-button id="test-connection-button-id">Test connection</vscode-button>
            <vscode-button id="submit-button-id">Save</vscode-button>
          </div>
        </div>
      </div>
    </div>
    <script type="module" nonce="${nonce}" src="${webviewUri}"></script>
  </body>
  
  </html>`;
}


export function getDatabaseWebviewContent(webview: Webview, context: ExtensionContext, keyword: String, rowDataObj: any) {
  const webviewUri = getUri(webview, context.extensionUri, ["out", "query-keyword.js"]);
  const styleUri = getUri(webview, context.extensionUri, ["out", "style.css"]);
  const boostrapGrid = getUri(webview, context.extensionUri, ["out", "bootstrap-grid.min.css"]);
  const codiconUri = getUri(webview, context.extensionUri, ["out", "codicon.css"]);
  const nonce = getNonce();
  // let htmlContent = fs.readFileSync(context.asAbsolutePath('resources/html/connection-manager.html'), 'utf8');

  webview.postMessage({
    command: "receiveDataInKeywordQueryWebview",
    payload: JSON.stringify(rowDataObj),
  });

  return `<!DOCTYPE html>
  <html lang="en">
  
  <head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Content-Security-Policy"
      content="default-src 'none'; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';">
    <link rel="stylesheet" href="${styleUri}">
    <link rel="stylesheet" href="${codiconUri}">
    <link rel="stylesheet" href="${boostrapGrid}">
    <title>Document</title>
  </head>
  
  <body>
    <h1>Kết quả</h1>
    <br>
    <br>
    <!-- Indicates that the divider semantically separates content -->
    <vscode-divider style="margin-top: 20px; margin-bottom: 20px;" role="separator"></vscode-divider>
    <div class="container-fluid">
      <div class="row">
        <h3 class="text-center">Kết quả tìm kiếm cho từ khóa "${keyword}"</h3>
        <div class="col-md-12">
          <vscode-panels>
              <vscode-panel-tab id="tab-1">COLUMNS</vscode-panel-tab>
              <vscode-panel-tab id="tab-2">TABLES</vscode-panel-tab>
              <vscode-panel-tab id="tab-3">PROCEDURES</vscode-panel-tab>
              <vscode-panel-tab id="tab-4">FUNCTIONS</vscode-panel-tab>
              <vscode-panel-tab id="tab-5">TRIGGERS</vscode-panel-tab>
              <vscode-panel-view id="view-1">
                  <vscode-data-grid id="columns-grid" style="width: max-content;" aria-label="Basic"></vscode-data-grid>
              </vscode-panel-view>
              <vscode-panel-view id="view-2">
                  <vscode-data-grid id="tables-grid" style="width: max-content;" aria-label="Basic"></vscode-data-grid>
              </vscode-panel-view>
              <vscode-panel-view id="view-3">
                  <vscode-data-grid id="procedures-grid" style="width: max-content;" aria-label="Basic"></vscode-data-grid>
              </vscode-panel-view>
              <vscode-panel-view id="view-4">
                  <vscode-data-grid id="functions-grid" style="width: max-content;" aria-label="Basic"></vscode-data-grid>
              </vscode-panel-view>
              <vscode-panel-view id="view-5">
                  <vscode-data-grid id="triggers-grid" style="width: max-content;" aria-label="Basic"></vscode-data-grid>
              </vscode-panel-view>
            </vscode-panels>
        </div>
      </div>
    </div>
    <script type="module" nonce="${nonce}" src="${webviewUri}"></script>
  </body>
  
  </html>`;
}