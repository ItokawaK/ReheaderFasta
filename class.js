class fastaEntry {
  constructor(id, seq='', sourceFile='') {
    this.id = id;
    this.original_id = id;
    this.seq = seq;
    this.sourceFile = sourceFile;
    this.include = true;
    this.len = seq.length
    this.num_unknown = seq.split(/[Nn]/).length - 1
  }

  extendSeq(instr){
    let tmp = $.trim(instr);
    this.seq += tmp;
    this.len += tmp.length;
    this.num_unknown += tmp.split(/[Nn]/).length - 1
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

class multiEntries {
  constructor() {
    this.entries = [];
    this.numEntries = 0;
    this.totalSeqLen = 0;
    this.oriNames = [];

  };

  add(entry){
    this.entries.push(entry);
    this.numEntries++;
    this.totalSeqLen += entry.seq.length
  };

  areIncluded(){
    let out = [];
    for (let i=0; i < this.numEntries; i++){
      out.push(this.entries[i].include)
    }
    return out
  }

}
