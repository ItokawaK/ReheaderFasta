class fastaEntry {
  constructor(id, seq='', sourceFile='') {
    this.id = id;
    this.seq = seq;
    this.sourceFile = sourceFile;
    this.include = true
  }

  extendSeq(instr){
    this.seq += $.trim(instr);
  }

  outFastaStr(lineLen=80){
    let outstrArray = [];
    outstrArray.push('>' + this.id );
    let tmp = [];
    for (let start=0; start < this.seq.length; start+=lineLen){
      outstrArray.push(this.seq.substr(start, lineLen))
    }

    return outstrArray.join('\n');
  }
}
