import {
  Component,
  ElementRef,
  AfterViewInit,
  ViewChild,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges
} from '@angular/core';

import loader from '@monaco-editor/loader';

@Component({
  selector: 'app-code-editor',
  templateUrl: './code-editor.component.html',
  styleUrls: ['./code-editor.component.css']
})
export class CodeEditorComponent implements AfterViewInit, OnChanges {

  @ViewChild('editorContainer', { static: true })
  editorContainer!: ElementRef;

  @Input() language = 'cpp';

  @Input() code = '';

  @Output() codeChange = new EventEmitter<string>();

  private editor: any;

  private editorReady = false;

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

    this.editorReady = true;

    this.editor.onDidChangeModelContent(() => {

      this.codeChange.emit(
        this.editor.getValue()
      );

    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.editorReady || !this.editor) {
      return;
    }

    if (changes['language'] && !changes['language'].firstChange) {
      this.editor.getModel()?.setLanguage(this.language);
    }

    if (changes['code'] && changes['code'].currentValue !== this.editor.getValue()) {
      this.editor.setValue(this.code);
    }
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