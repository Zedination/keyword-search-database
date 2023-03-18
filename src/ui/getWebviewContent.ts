import {ExtensionContext} from "vscode";
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
export function getWebviewContent(webview: Webview, context: ExtensionContext) {
  const webviewUri = getUri(webview, context.extensionUri, ["out", "webview.js"]);
  const styleUri = getUri(webview, context.extensionUri, ["out", "style.css"]);

  const nonce = getNonce();
  // let htmlContent = fs.readFileSync(context.asAbsolutePath('resources/html/connection-manager.html'), 'utf8');

  webview.onDidReceiveMessage((message) => {
    // const command = message.command;
    // switch (command) {
    //   case "requestNoteData":
    //     webview.postMessage({
    //       command: "receiveDataInWebview",
    //       payload: JSON.stringify(note),
    //     });
    //     break;
    // }
  });

  return `<!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';">
    <link rel="stylesheet" href="${styleUri}">
    <title>Document</title>
  </head>
  <body>
    <h1>Hello Webview Panel</h1>
    <br>
    <br>
    <section id="notes-form">
          <vscode-text-field id="title" value="" placeholder="Enter a name">Title</vscode-text-field>
          <vscode-text-area id="content"value="" placeholder="Write your heart out, Shakespeare!" resize="vertical" rows=15>Note</vscode-text-area>
          <vscode-text-field id="tags-input" value="" placeholder="Add tags separated by commas">Tags</vscode-text-field>
          <vscode-button id="submit-button">Save</vscode-button>
        </section>
    <script type="module" nonce="${nonce}" src="${webviewUri}"></script>
  </body>
  </html>`;
}
