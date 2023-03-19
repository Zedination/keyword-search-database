import {
    provideVSCodeDesignSystem,
    Button,
    Tag,
    TextArea,
    TextField,
    Dropdown,
    Option,
    Checkbox,
    vsCodeButton,
    vsCodeTag,
    vsCodeTextArea,
    vsCodeTextField,
    vsCodeDivider,
    vsCodeBadge,
    vsCodeCheckbox,
    vsCodeDataGrid,
    vsCodeDataGridCell,
    vsCodeDataGridRow,
    vsCodeDropdown,
    vsCodeOption
} from "@vscode/webview-ui-toolkit";


// In order to use the Webview UI Toolkit web components they
// must be registered with the browser (i.e. webview) using the
// syntax below.
provideVSCodeDesignSystem().register(
    vsCodeButton(),
    vsCodeTag(),
    vsCodeTextArea(),
    vsCodeTextField(),
    vsCodeDivider(),
    vsCodeDropdown(),
    vsCodeOption(),
    vsCodeCheckbox(),
    
);

// Get access to the VS Code API from within the webview context
const vscode = acquireVsCodeApi();

// Just like a regular webpage we need to wait for the webview
// DOM to load before we can reference any of the HTML elements
// or toolkit components
window.addEventListener("load", () => {
    setVSCodeMessageListener();
    vscode.postMessage({ command: "requestConnectionData" });

    const saveConnectionButton = document.getElementById("submit-button-id") as Button;
    saveConnectionButton.addEventListener("click", () => saveConnections());

    const testConnectionButton = document.getElementById("test-connection-button-id") as Button;
    testConnectionButton.addEventListener("click", () => testConnection());
});

function setVSCodeMessageListener() {
    window.addEventListener("message", (event) => {
      const command = event.data.command;
      const connectionData = JSON.parse(event.data.payload);
  
      switch (command) {
        case "receiveDataInConnectionDetailWebview":
            openedConnection = connectionData;
          break;
      }
    });
  }

let openedConnection;

function buildObject() {
    const connectionName = document.getElementById('connection-name-id') as TextField;
    const databaseDriver = document.getElementById('database-driver-id') as Dropdown;
    const host = document.getElementById('host-name-id') as TextField;
    const port = document.getElementById('port-id') as TextField;
    const username = document.getElementById('username-id') as TextField;
    const password = document.getElementById('password-id') as TextField;
    const database = document.getElementById('database-id') as TextField;
    const isActive = document.getElementById('is-active-id') as Checkbox;

    const connectionNameValue = connectionName?.value;
    // 1: MySQL, 2: PostgreSQL, 3: MariaDB
    let databaseDriverValue = 'mysql';
    switch (databaseDriver?.selectedIndex) {
        case 0:
            databaseDriverValue = 'mysql';
            break;
        case 1:
            databaseDriverValue = 'postgresql';
            break;
        case 2:
            databaseDriverValue = 'mariadb';
            break;
        default:
            databaseDriverValue = 'mysql';
            break;
    }
    const hostValue = host?.value;
    const portValue = port?.value;
    const usernameValue = username?.value;
    const passwordValue = password?.value;
    const databaseValue = database?.value;
    const isActiveValue: boolean = isActive?.checked;

    return {
        id: openedConnection.id,
        connectionName: connectionNameValue,
        databaseDriver: databaseDriverValue,
        host: hostValue,
        port: portValue,
        username: usernameValue,
        password: passwordValue,
        database: databaseValue,
        isActive: isActiveValue,
    }
}

function saveConnections() {
    let object = buildObject();
    vscode.postMessage({command: "updateConnection", connection: object});
}

function testConnection() {
    let data = buildObject();
    vscode.postMessage({command: "testConnection", connection: data});
}