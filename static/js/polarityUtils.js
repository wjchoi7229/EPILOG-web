class PolarityUtils {
    constructor(targetId, inputVirusSeq, outputVirusSeq, callbak) {
        this.targetId = targetId;

        this.callbak = callbak;
        this.inputVirusSeq = inputVirusSeq;
        this.outputVirusSeq = outputVirusSeq;
        this.diffVirusSeq = '';
        this.inputPolarSeq = '';
        this.inputFiveSeq = '';
        this.outputPolarSeq = '';
        this.outputFiveSeq = '';

        this.dicInputPolar = {'N-N-＊' : 0,'N-P-＊' : 0,'N-A-＊' : 0,'N-B-＊' : 0,'P-N-＊' : 0,'P-P-＊' : 0,'P-A-＊' : 0,'P-B-＊' : 0,'A-N-＊' : 0,'A-P-＊' : 0,'A-A-＊' : 0,'A-B-＊' : 0,'B-N-＊' : 0,'B-P-＊' : 0,'B-B-＊' : 0,'B-A-＊' : 0,'ETC' : 0,};
        this.dicOutputPolar = {'N-N-＊' : 0,'N-P-＊' : 0,'N-A-＊' : 0,'N-B-＊' : 0,'P-N-＊' : 0,'P-P-＊' : 0,'P-A-＊' : 0,'P-B-＊' : 0,'A-N-＊' : 0,'A-P-＊' : 0,'A-A-＊' : 0,'A-B-＊' : 0,'B-N-＊' : 0,'B-P-＊' : 0,'B-B-＊' : 0,'B-A-＊' : 0,'ETC' : 0,};
        //Polarity feature	Polarity feature_S	Amino acid
        this.DIC_POLAR_FEATURE = {'A' : 'N','V' : 'N','L' : 'N','G' : 'N','I' : 'N','M' : 'N','W' : 'N','F' : 'N','P' : 'N','S' : 'P','C' : 'P','N' : 'P','Q' : 'P','T' : 'P','Y' : 'P','D' : 'A','E' : 'A','K' : 'B','R' : 'B','H' : 'B',};
        //Five amino acid properties
        this.DIC_FIVE_AA = {'K' : 'E','R' : 'E','H' : 'E','D' : 'O','E' : 'O','S' : 'P','N' : 'P','Q' : 'P','T' : 'P','C' : 'S','G' : 'S','P' : 'S','A' : 'H','V' : 'H','L' : 'H','I' : 'H','M' : 'H','W' : 'H','F' : 'H', 'Y' : 'H',};
    }

    async drawVirusInfo(){
        const promises = [];

        promises.push(this.calcPolarFiveSeq());
        promises.push(this.calcPolarity());
        promises.push(this.calcDiffSeq());

        const result = await Promise.all(promises);
        return result;
    }

    makeVirusSeqInfo(){
        const arrSeq = Array.from(this.inputVirusSeq);
        arrSeq.forEach((seq, idx) => {
            $(`#${this.targetId}Input`)
            .append(
                $('<span class="row">')
                .append($('<span class="mut">').text(`${this.diffVirusSeq[idx] == '1' ? '↓': ''}`))
                .append($('<span class="txt color ">').html(seq == undefined ? '&nbsp;' : seq).addClass(`diffSeq${this.diffVirusSeq[idx]}`))
                .append($('<span class="txt color ">').html(this.inputPolarSeq[idx] == undefined ? '&nbsp;' : this.inputPolarSeq[idx]).addClass(`polar${this.inputPolarSeq[idx]}${this.diffVirusSeq[idx]}`))
                .append($('<span class="txt color ">').html(this.inputFiveSeq[idx] == undefined ? '&nbsp;' : this.inputFiveSeq[idx]).addClass(`five${this.inputFiveSeq[idx]}${this.diffVirusSeq[idx]}`))
            );

            $(`#${this.targetId}Output`)
            .append(
                $('<span class="row">')
                .append($('<span class="mut">').text(`${this.diffVirusSeq[idx] == '1' ? '↓': ''}`))
                .append($('<span class="txt color ">').html(this.outputVirusSeq[idx] == undefined ? '&nbsp;' : this.outputVirusSeq[idx]).addClass(`diffSeq${this.diffVirusSeq[idx]}`))
                .append($('<span class="txt color ">').html(this.outputPolarSeq[idx] == undefined ? '&nbsp;' : this.outputPolarSeq[idx]).addClass(`polar${this.outputPolarSeq[idx]}${this.diffVirusSeq[idx]}`))
                .append($('<span class="txt color ">').html(this.outputFiveSeq[idx] == undefined ? '&nbsp;' : this.outputFiveSeq[idx]).addClass(`five${this.outputFiveSeq[idx]}${this.diffVirusSeq[idx]}`))
            );
        })
    }

     makePolarityInfo(){
        for (let key in this.dicInputPolar){
            if(key == "P-P-＊" || key == "N-N-＊"  || key == "ETC" ){
            $(`#${this.targetId}Tbl > tbody`)
            .append(
                $('<tr>')
                .append($('<td>').text(key))
                .append($('<td>').text(this.dicInputPolar[key]))
                .append($('<td>').text(this.dicOutputPolar[key]))
                );
            }
        }
    }

    calcPolarFiveSeq(){
        return new Promise((resolve, reject) => {

            const arrInputSeq = Array.from(this.inputVirusSeq);
            const arrOutputSeq = Array.from(this.outputVirusSeq);

            arrInputSeq.map(seq => {

                this.inputPolarSeq += this.DIC_POLAR_FEATURE[seq];

                this.inputFiveSeq += this.DIC_FIVE_AA[seq];
            });

            arrOutputSeq.map(seq => {

                this.outputPolarSeq += this.DIC_POLAR_FEATURE[seq];

                this.outputFiveSeq += this.DIC_FIVE_AA[seq];
            });

            resolve(true)
        });
    }

    calcPolarity(){
        return new Promise((resolve, reject) => {

            for (let i=0; i<this.inputPolarSeq.length -2; i++){

                if (this.inputPolarSeq.slice(i, i+2) == 'NN') this.dicInputPolar['N-N-＊'] += 1
                else if (this.inputPolarSeq.slice(i, i+2) == 'NP') this.dicInputPolar['N-P-＊'] += 1, this.dicInputPolar['ETC'] += 1
                else if (this.inputPolarSeq.slice(i, i+2) == 'NA') this.dicInputPolar['N-A-＊'] += 1, this.dicInputPolar['ETC'] += 1
                else if (this.inputPolarSeq.slice(i, i+2) == 'NB') this.dicInputPolar['N-B-＊'] += 1, this.dicInputPolar['ETC'] += 1
                else if (this.inputPolarSeq.slice(i, i+2) == 'PN') this.dicInputPolar['P-N-＊'] += 1, this.dicInputPolar['ETC'] += 1
                else if (this.inputPolarSeq.slice(i, i+2) == 'PP') this.dicInputPolar['P-P-＊'] += 1
                else if (this.inputPolarSeq.slice(i, i+2) == 'PA') this.dicInputPolar['P-A-＊'] += 1, this.dicInputPolar['ETC'] += 1
                else if (this.inputPolarSeq.slice(i, i+2) == 'PB') this.dicInputPolar['P-B-＊'] += 1, this.dicInputPolar['ETC'] += 1
                else if (this.inputPolarSeq.slice(i, i+2) == 'AA') this.dicInputPolar['A-A-＊'] += 1, this.dicInputPolar['ETC'] += 1
                else if (this.inputPolarSeq.slice(i, i+2) == 'AB') this.dicInputPolar['A-B-＊'] += 1, this.dicInputPolar['ETC'] += 1
                else if (this.inputPolarSeq.slice(i, i+2) == 'AN') this.dicInputPolar['A-N-＊'] += 1, this.dicInputPolar['ETC'] += 1
                else if (this.inputPolarSeq.slice(i, i+2) == 'AP') this.dicInputPolar['A-P-＊'] += 1, this.dicInputPolar['ETC'] += 1
                else if (this.inputPolarSeq.slice(i, i+2) == 'BN') this.dicInputPolar['B-N-＊'] += 1, this.dicInputPolar['ETC'] += 1
                else if (this.inputPolarSeq.slice(i, i+2) == 'BP') this.dicInputPolar['B-P-＊'] += 1, this.dicInputPolar['ETC'] += 1
                else if (this.inputPolarSeq.slice(i, i+2) == 'BA') this.dicInputPolar['B-A-＊'] += 1, this.dicInputPolar['ETC'] += 1
                else if (this.inputPolarSeq.slice(i, i+2) == 'BB') this.dicInputPolar['B-B-＊'] += 1, this.dicInputPolar['ETC'] += 1
                else this.dicInputPolar['ETC'] += 1
            }

            for (let i=0; i<this.outputPolarSeq.length -2; i++){
                if (this.outputPolarSeq.slice(i, i+2) == 'NN') this.dicOutputPolar['N-N-＊'] += 1
                else if (this.outputPolarSeq.slice(i, i+2) == 'NP') this.dicOutputPolar['N-P-＊'] += 1, this.dicOutputPolar['ETC'] += 1
                else if (this.outputPolarSeq.slice(i, i+2) == 'NA') this.dicOutputPolar['N-A-＊'] += 1, this.dicOutputPolar['ETC'] += 1
                else if (this.outputPolarSeq.slice(i, i+2) == 'NB') this.dicOutputPolar['N-B-＊'] += 1, this.dicOutputPolar['ETC'] += 1
                else if (this.outputPolarSeq.slice(i, i+2) == 'PN') this.dicOutputPolar['P-N-＊'] += 1, this.dicOutputPolar['ETC'] += 1
                else if (this.outputPolarSeq.slice(i, i+2) == 'PP') this.dicOutputPolar['P-P-＊'] += 1
                else if (this.outputPolarSeq.slice(i, i+2) == 'PA') this.dicOutputPolar['P-A-＊'] += 1, this.dicOutputPolar['ETC'] += 1
                else if (this.outputPolarSeq.slice(i, i+2) == 'PB') this.dicOutputPolar['P-B-＊'] += 1, this.dicOutputPolar['ETC'] += 1
                else if (this.outputPolarSeq.slice(i, i+2) == 'AA') this.dicOutputPolar['A-A-＊'] += 1, this.dicOutputPolar['ETC'] += 1
                else if (this.outputPolarSeq.slice(i, i+2) == 'AB') this.dicOutputPolar['A-B-＊'] += 1, this.dicOutputPolar['ETC'] += 1
                else if (this.outputPolarSeq.slice(i, i+2) == 'AN') this.dicOutputPolar['A-N-＊'] += 1, this.dicOutputPolar['ETC'] += 1
                else if (this.outputPolarSeq.slice(i, i+2) == 'AP') this.dicOutputPolar['A-P-＊'] += 1, this.dicOutputPolar['ETC'] += 1
                else if (this.outputPolarSeq.slice(i, i+2) == 'BN') this.dicOutputPolar['B-N-＊'] += 1, this.dicOutputPolar['ETC'] += 1
                else if (this.outputPolarSeq.slice(i, i+2) == 'BP') this.dicOutputPolar['B-P-＊'] += 1, this.dicOutputPolar['ETC'] += 1
                else if (this.outputPolarSeq.slice(i, i+2) == 'BA') this.dicOutputPolar['B-A-＊'] += 1, this.dicOutputPolar['ETC'] += 1
                else if (this.outputPolarSeq.slice(i, i+2) == 'BB') this.dicOutputPolar['B-B-＊'] += 1, this.dicOutputPolar['ETC'] += 1
                else this.dicOutputPolar['ETC'] += 1
            }

            resolve(true)
        });

    }

    calcDiffSeq(){
        return new Promise((resolve, reject) => {
            for (let i=0; i<this.inputVirusSeq.length; i++){
                if (this.inputVirusSeq[i] == this.outputVirusSeq[i]) this.diffVirusSeq +='0'
                else this.diffVirusSeq +='1'
            }
            resolve(true)
        });
    }
}

