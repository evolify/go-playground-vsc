'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode'
import axios from 'axios'

const {window,workspace,Disposable} = vscode

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    let textSaveHandler = new TextSaveHandler()

    context.subscriptions.push(textSaveHandler)
}

class TextSaveHandler{
  private disposable :vscode.Disposable
  private logger :vscode.OutputChannel
  constructor(){
    let subscriptions: vscode.Disposable[] = []
    workspace.onDidSaveTextDocument(this.onTextSave,this,subscriptions)
    this.disposable = Disposable.from(...subscriptions)
    this.logger = window.createOutputChannel('output')
  }

  private onTextSave(){
    let code = window.activeTextEditor!.document.getText()
    axios.post('https://play.golang.org/compile',{version:2,body:code})
      .then(res=>res.data)
      .then(({Errors,Events})=>{
        if(!this.logger){
          this.logger = window.createOutputChannel('output')
        }
        this.logger.clear()
        if(Errors){
          this.logger.append(Errors+'')
        }else{
          this.logger.append(Events[0].Message)
        }
        this.logger.show()
        window.activeTextEditor!.show()
      })
  }

  dispose(){
    this.disposable.dispose()
    this.logger.dispose()
  }
}


// this method is called when your extension is deactivated
export function deactivate() {
}