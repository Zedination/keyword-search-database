import {
    provideVSCodeDesignSystem,
    Button,
    Tag,
    TextArea,
    TextField,
    Dropdown,
    Option,
    Checkbox,
    DataGrid,
    PanelView,
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
    vsCodeOption,
    vsCodePanels,
    vsCodePanelTab,
    vsCodePanelView
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
    vsCodePanels(),
    vsCodePanelTab(),
    vsCodePanelView(),
    vsCodeDataGrid(),
    vsCodeDataGridCell(),
    vsCodeDataGridRow(),
);

// Get access to the VS Code API from within the webview context
const vscode = acquireVsCodeApi();

window.addEventListener("load", () => {
    setVSCodeMessageListener();
});
let data;
function setVSCodeMessageListener() {
    window.addEventListener("message", (event) => {
      const command = event.data.command;
      const rowDataObj = JSON.parse(event.data.payload);
  
      switch (command) {
        case "receiveDataInKeywordQueryWebview":
            bindingData(rowDataObj);
          break;
      }
    });
}

function bindingData(rowDataObj: any) {
    const dataGridColumns = document.getElementById('columns-grid') as DataGrid;
    const dataGridTables = document.getElementById('tables-grid') as DataGrid;
    const dataGridProcedures = document.getElementById('procedures-grid') as DataGrid;
    const dataGridFunctions = document.getElementById('functions-grid') as DataGrid;
    const dataGridTriggers = document.getElementById('triggers-grid') as DataGrid;
    dataGridColumns.rowsData = rowDataObj.columns;
    dataGridTables.rowsData = rowDataObj.tables;
    dataGridProcedures.rowsData = rowDataObj.procedures;
    dataGridFunctions.rowsData = rowDataObj.functions;
    dataGridTriggers.rowsData = rowDataObj.triggers;
    // dataGridColumns.rowsData = [
    //     { Header1: "Cell Data", Header2: "Cell Data", Header3: "Cell Data", Header4: "Cell Data" },
    //     { Header1: "Cell Data", Header2: "Cell Data", Header3: "Cell Data", Header4: "Cell Data" },
    //     { Header1: "Cell Data", Header2: "Cell Data", Header3: "Cell Data", Header4: "Cell Data" },
    //   ];
}

function overrideConstructedStylesheet() {
    const dataGridColumns = document.getElementById('columns-grid') as DataGrid;
    const view1 = document.getElementById('view-1') as PanelView;
    dataGridColumns.style.width = 'max-content';
    view1.style.width = 'max-content !important;';
    view1.style.overflowY = 'scroll !important;';
}