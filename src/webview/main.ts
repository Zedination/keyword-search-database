import {
    provideVSCodeDesignSystem,
    Button,
    Tag,
    TextArea,
    TextField,
    vsCodeButton,
    vsCodeTag,
    vsCodeTextArea,
    vsCodeTextField,
} from "@vscode/webview-ui-toolkit";


// In order to use the Webview UI Toolkit web components they
// must be registered with the browser (i.e. webview) using the
// syntax below.
provideVSCodeDesignSystem().register(
    vsCodeButton(),
    vsCodeTag(),
    vsCodeTextArea(),
    vsCodeTextField()
);

// Get access to the VS Code API from within the webview context
const vscode = acquireVsCodeApi();

// Just like a regular webpage we need to wait for the webview
// DOM to load before we can reference any of the HTML elements
// or toolkit components
window.addEventListener("load", () => {
    
});

