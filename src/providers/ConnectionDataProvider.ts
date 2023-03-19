import { Connection } from '../model/Connection';
import { Event, EventEmitter, ProviderResult, ThemeIcon, TreeDataProvider, TreeItem } from "vscode";

// A custom type to keep the code below more tidy
type TreeDataOnChangeEvent = ConnectionProfile | undefined | null | void;

/**
 * An implementation of the TreeDataProvider interface.
 *
 * This class is responsible for managing the tree data that the VS Code
 * TreeView API needs to render a custom tree view.
 *
 * Learn more about Tree Data Providers here:
 * https://code.visualstudio.com/api/extension-guides/tree-view#tree-data-provider
 */
export class ConnectionDataProvider implements TreeDataProvider<ConnectionProfile> {
  private _onDidChangeTreeData = new EventEmitter<TreeDataOnChangeEvent>();
  readonly onDidChangeTreeData: Event<TreeDataOnChangeEvent> = this._onDidChangeTreeData.event;

  data: ConnectionProfile[];

  constructor(connectionsData: Connection[]) {
    this.data = connectionsData.map((connection) => new ConnectionProfile(connection.id, connection.connectionName));
  }

  refresh(connectionsData: Connection[]): void {
    this._onDidChangeTreeData.fire();
    this.data = connectionsData.map((connection) => new ConnectionProfile(connection.id, connection.connectionName));
  }

  getTreeItem(element: ConnectionProfile): TreeItem | Thenable<TreeItem> {
    return element;
  }

  getChildren(element?: ConnectionProfile | undefined): ProviderResult<ConnectionProfile[]> {
    if (element === undefined) {
      return this.data;
    }
    return element.children;
  }

  getParent() {
    return null;
  }
}

class ConnectionProfile extends TreeItem {
  children?: ConnectionProfile[];

  constructor(connectionId: string, noteTitle: string) {
    super(noteTitle);
    this.id = connectionId;
    this.iconPath = new ThemeIcon("list-flat");
    this.command = {
      title: "Open connection manager",
      command: "connectionManager.showConnectionDetailView",
    };
  }
}
