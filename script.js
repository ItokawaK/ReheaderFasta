// var in_fasta='>seq1\nATGCTG\n>seq2\nATCCCCC\nfafafaf\n>seq3\nfgjksdfl';

// var document.getElementById('file');

var rowFastaStr;
var fastaEntries = [];
var oriFasta;
var $grid = $('#grid');
var hot;
var inFileName;
var $fileInput = $('#file');

// $('#file')[0].addEventListener('change', getFastaFile, false);
$fileInput.bind('change', getFastaFile);

function validateHeader(in_str){
  var isAscii = /^[\x00-\x7F]+$/;
  var forbidden = /[>]/;
  if (in_str == ''){
    return false
  }
  if (!isAscii.test(in_str)){
    return false
  }
  if (forbidden.test(in_str)){
    return false
  }

  return true
}


function getFastaFile(evt){
  let files = evt.target.files;
  rowFastaStr = [];
  oriFasta = {fastaLines:[], headers: []};

  // fastaEntries = [];

  for (var i = 0, f; f = files[i]; i++) {
    let reader = new FileReader();
    reader.fileName = f.name;
    inFileName = f.name;
    reader.onload = function() {
      let tmp = parseFASTA(reader.result, reader.fileName);
      if (tmp) {
        fastaEntries = fastaEntries.concat(tmp)
      };
      generateGrid()
    };
    reader.readAsText(f)
  };
};

function dropFastaFile(evt){
  evt.preventDefault();

  var isfasta = /.fasta$|.fa$|.fas$|.msa$/

  if (evt.dataTransfer.items) {
    // Use DataTransferItemList interface to access the file(s)
    for (var i = 0; i < evt.dataTransfer.items.length; i++) {
      // If dropped items aren't files, reject them
      if (evt.dataTransfer.items[i].kind === 'file') {
        var f = evt.dataTransfer.items[i].getAsFile();
        if (!isfasta.test(f.name)){console.log(f.name + ' =>error');continue}
        let reader = new FileReader();
        reader.fileName = f.name;
        inFileName = f.name;
        reader.onload = function() {
          let tmp = parseFASTA(reader.result, reader.fileName);
          if (tmp) {
            fastaEntries = fastaEntries.concat(tmp)
          };
          generateGrid()
        };
        reader.readAsText(f)
      }
    }
  } else {
    // Use DataTransfer interface to access the file(s)
    for (var i = 0; i < evt.dataTransfer.files.length; i++) {
      console.log('... file[' + i + '].name = ' + ev.dataTransfer.files[i].name);
    }
  }
};

function dragOverHandler(ev) {
  // Prevent default behavior (Prevent file from being opened)
  ev.preventDefault();
}

function generateGrid(){
  var data = [];

  fastaEntries.forEach((item, i) => {
    // data.push([item.sourceFile, item.id, ' => ', item.id])
    data.push({
      SourceFile: item.sourceFile,
      OriginalName: item.id,
      Arrow: ' => ',
      NewName: item.id,
      Include: item.include
    })
  });

  $grid.empty();

  // let tbl = document.createElement("div");
  let $tbl = $('<div></div>');

  // $grid[0].appendChild(tbl);
  $grid.append($tbl);

  hot = new Handsontable($tbl[0], {
    data: data,
    columns: [
      { data: 'SourceFile', readOnly: true, type: 'text' },
      { data: 'OriginalName', readOnly: true, type: 'text' },
      { data: 'Arrow', readOnly: true, type: 'text' },
      { data: 'NewName', type: 'text'},
      { data: 'Include', type: 'checkbox' },
      { data: 'Info', readOnly: true, type: 'text' }
    ],
    width: '100%',
    // height: 320,
    rowHeaders: true,
    colHeaders: ['SourceFile','OriginalName', '', 'NewName', 'Include in<br>output<br>file', 'Info'],
    fixedColumnsLeft: 2
  });

  hot.validating = false;

  hot.addHook('afterChange', function(changes, source){
    if (source === 'loadData' || source === 'internal'){return};
    // if (!changes) {return};
    if (this.validating) {return};
    // console.log(source);
    // return false;
    for (let i=0; i < changes.length; i++){
      let row, prop, oldValue, newValue;
      [row, prop, oldValue, newValue] = changes[i];

      if (prop == 'NewName'){
        if (newValue != this.getDataAtRowProp(row,'OriginalName')){
          this.setDataAtRowProp(row,'Info', 'Edited')
        }else{
          this.setDataAtRowProp(row,'Info', '')
        }
        this.setDataAtRowProp(row,'Include', true)
      }
    };

    this.validate()
  });

  hot.validate = function (){

    this.validating = true;
    let newnames = this.getDataAtProp('NewName');
    let isincludes = this.getDataAtProp('Include');
    let already_used = {};
    // console.log(isincludes);
    for (let row=0; row < newnames.length; row++){
      fastaEntries[row].id = newnames[row];
      fastaEntries[row].include = isincludes[row];
      if (!validateHeader(newnames[row])){
        this.setDataAtRowProp(row,'Info', 'Contains invalid character(s) or is empty!');
        this.setDataAtRowProp(row,'Include', false);
        // console.log('aa');
        fastaEntries[row].include = false;
      }else if (already_used[newnames[row]]){
        this.setDataAtRowProp(row,'Info', 'Duplicated!');
        this.setDataAtRowProp(row,'Include', false);
        console.log('bb');
        fastaEntries[row].include = false;
      }else if(isincludes[row]){
        already_used[newnames[row]] = true;
      }
    };
    this.validating = false
    // console.log(this.getDataAtProp('Include'));
  };

  hot.validate()
};



function parseFASTA(fastaStr, fileName=''){

  let inLines = fastaStr.split(/\r?\r?\n/);
  let outFastaEntries = [];
  let e = null;

  if (!inLines[0].startsWith('>')) {
    window.alert(fileName + ' does not seem FASTA.');
    return
  }

  for (let i=0,line; line=inLines[i]; i++){
    if (line.startsWith('>')){
      if (e){
        outFastaEntries.push(e)
      }
      let h = line.replace(/^>/, '');
      e = new fastaEntry(h,'',fileName)
    }else{
      if (line){
        e.extendSeq(line)
      }
    }
  }

  if (e){
    outFastaEntries.push(e)
  }

  return outFastaEntries
}

function downloadFasta(){

  var valid = true;

  if(valid){
    let outFastaStrArray = [];
    for (let i=0,e; e = fastaEntries[i]; i++){
      if (e.include){
        outFastaStrArray.push(e.outFastaStr());
        console.log(e.id, 'len: ' + e.seq.length)
      }
    }

    let newFasta = outFastaStrArray.join('\n');

    // console.log(newFasta);

    let blob = new Blob([newFasta], {type:"text/plain"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    document.body.appendChild(a);
    a.download = 'RENAMED_' + inFileName;
    a.href = url;
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }
}