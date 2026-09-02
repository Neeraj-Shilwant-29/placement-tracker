import {
  Component,
  ElementRef,
  AfterViewInit,
  ViewChild,
  Input,
  Output,
  EventEmitter
} from '@angular/core';

import loader from '@monaco-editor/loader';

@Component({
  selector: 'app-code-editor',
  templateUrl: './code-editor.component.html',
  styleUrls: ['./code-editor.component.css']
})
export class CodeEditorComponent implements AfterViewInit {

  @ViewChild('editorContainer', { static: true })
  editorContainer!: ElementRef;

  @Input() language = 'cpp';

  @Input() code = '';

  @Output() codeChange = new EventEmitter<string>();

  private editor: any;

  async ngAfterViewInit() {

    const monaco = await loader.init();

    this.editor = monaco.editor.create(
      this.editorContainer.nativeElement,
      {
        value: this.code,

        language: this.language,

        theme: 'vs-dark',

        automaticLayout: true,

        fontSize: 15,

        lineNumbers: 'on',

        minimap: {
          enabled: false
        },

        scrollBeyondLastLine: false,

        wordWrap: 'on',

        padding: {
          top: 15,
          bottom: 15
        },

        tabSize: 4,

        renderWhitespace: 'selection'
      }
    );

    this.editor.onDidChangeModelContent(() => {

      this.codeChange.emit(
        this.editor.getValue()
      );

    });
  }


  getCode(): string {

    return this.editor?.getValue() || '';

  }


  setCode(code: string) {

    this.editor?.setValue(code);

  }


  ngOnDestroy() {

    this.editor?.dispose();

  }
}