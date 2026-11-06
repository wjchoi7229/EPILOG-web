const drawAtonset = () => {

    // Set data
    const DOA = [{
        country: "apparently normal",
        value: 69
    }, {
        country: "undetermined",
        value: 307
    }, {
        country: "apparently delayed",
        value: 73
    }, {
        country: "NA",
        value: 590
    }];

    amChartBar1('chartdivat1', DOA);

    const AGE_AT_SZ = [
        { country:"0", sales:1}
        ,{ country:"1", sales:102}
        ,{ country:"10", sales:5}
        ,{ country:"105", sales:1}
        ,{ country:"1058", sales:1}
        ,{ country:"1095", sales:9}
        ,{ country:"120", sales:25}
        ,{ country:"1200", sales:1}
        ,{ country:"1260", sales:1}
        ,{ country:"13", sales:2}
        ,{ country:"135", sales:1}
        ,{ country:"14", sales:6}
        ,{ country:"1460", sales:3}
        ,{ country:"15", sales:2}
        ,{ country:"150", sales:8}
        ,{ country:"165", sales:1}
        ,{ country:"1650", sales:1}
        ,{ country:"180", sales:18}
        ,{ country:"1800", sales:1}
        ,{ country:"1825", sales:1}
        ,{ country:"19", sales:1}
        ,{ country:"2", sales:58}
        ,{ country:"20", sales:1}
        ,{ country:"21", sales:1}
        ,{ country:"210", sales:3}
        ,{ country:"2160", sales:1}
        ,{ country:"2190", sales:3}
        ,{ country:"225", sales:1}
        ,{ country:"2340", sales:1}
        ,{ country:"24", sales:4}
        ,{ country:"240", sales:15}
        ,{ country:"2555", sales:2}
        ,{ country:"270", sales:6}
        ,{ country:"28", sales:1}
        ,{ country:"3", sales:39}
        ,{ country:"30", sales:25}
        ,{ country:"300", sales:10}
        ,{ country:"3210", sales:1}
        ,{ country:"330", sales:15}
        ,{ country:"35", sales:2}
        ,{ country:"36", sales:1}
        ,{ country:"365", sales:16}
        ,{ country:"390", sales:2}
        ,{ country:"4", sales:16}
        ,{ country:"401", sales:1}
        ,{ country:"42", sales:2}
        ,{ country:"420", sales:9}
        ,{ country:"4380", sales:1}
        ,{ country:"45", sales:2}
        ,{ country:"450", sales:7}
        ,{ country:"480", sales:1}
        ,{ country:"5", sales:9}
        ,{ country:"510", sales:3}
        ,{ country:"540", sales:3}
        ,{ country:"547", sales:4}
        ,{ country:"570", sales:1}
        ,{ country:"6", sales:8}
        ,{ country:"60", sales:17}
        ,{ country:"6205", sales:2}
        ,{ country:"6210", sales:1}
        ,{ country:"630", sales:3}
        ,{ country:"690", sales:4}
        ,{ country:"7", sales:5}
        ,{ country:"72", sales:1}
        ,{ country:"720", sales:4}
        ,{ country:"730", sales:2}
        ,{ country:"75", sales:1}
        ,{ country:"750", sales:1}
        ,{ country:"780", sales:2}
        ,{ country:"8", sales:9}
        ,{ country:"810", sales:1}
        ,{ country:"9", sales:7}
        ,{ country:"90", sales:63}
        ,{ country:"900", sales:6}
        ,{ country:"912", sales:1}
        ,{ country:"9490", sales:1}
        ,{ country:"NA", sales:397}
        ,{ country:"infancy", sales:2}
        ,{ country:"late onset", sales:8}
        ,{ country:"neonatal", sales:27}
        ,{ country:"no seizure", sales:6}
    ];
    amChartPie('chartdivat2', AGE_AT_SZ);

    const CLASSFICATION = [{
        country: "<30 days",
        value: 304
    }, {
        country: "NA",
        value: 397
    }, {
        country: ">1yr",
        value: 112
    }, {
        country: "no seizure",
        value: 6
    }, {
        country: "Infancy",
        value: 220
    }];
    amChartBar2('chartdivat3', CLASSFICATION);

    const SZ_TP = [{ category:" tonic (Ohtaharra syndrome)", value:96}
        ,{ category:"focal  including focal clonic, autonomic...", value:98}
        ,{ category:"NA", value:13}
        ,{ category:"hemiclonic", value:10}
        ,{ category:"bilateral clonic", value:11}
        ,{ category:"spasms", value:34}
        ,{ category:"myoclonic seizure", value:15}
        ,{ category:"absence seizure", value:4}
        ,{ category:"Multiple", value:83}
        ,{ category:"NA", value:669}
        ,{ category:"no seizure", value:6}
    ];
    amChartPie2('chartdivat4', SZ_TP);

    const ASM = [
        { country:"seizure free", sales:45}
        ,{ country:"seizure >90% reduction", sales:32}
        ,{ country:"undetermined", sales:54}
        ,{ country:"seizure aggravation ", sales:40}
        ,{ country:"NA", sales:862}
        ,{ country:"no seizure", sales:6}
    ];
    amChartPie('chartdivat5', ASM);

    const RES_NA_BLOCKER = [
        { country: "Yes", value: 60}
        ,{ country: "No", value: 979}
    ];
    amChartBar2('chartdivat6', RES_NA_BLOCKER);

    const REA_ASM = [
        { category:"NA", value:881}
        ,{ category:"PHT", value:20}
        ,{ category:"VPA", value:20}
        ,{ category:"TPM", value:15}
        ,{ category:"PB", value:12}
        ,{ category:"OXC", value:11}
        ,{ category:"LEV", value:9}
        ,{ category:"VGB", value:7}
        ,{ category:"no seizure", value:6}
        ,{ category:"CBZ", value:6}
        ,{ category:"Pb", value:6}
        ,{ category:"None", value:6}
        ,{ category:"LCS", value:4}
        ,{ category:"CLZ", value:3}
        ,{ category:"CLB", value:3}
        ,{ category:"MDZ", value:3}
        ,{ category:"na", value:3}
        ,{ category:"DPH", value:2}
        ,{ category:"LTG", value:2}
        ,{ category:"fPHT", value:2}
        ,{ category:"bromide", value:1}
        ,{ category:"LCM", value:1}
        ,{ category:"Lidocaine", value:1}
        ,{ category:"ACTH", value:1}
        ,{ category:"diazepam", value:1}
        ,{ category:"Several ASM", value:1}
        ,{ category:"Ketognic diet (no effect)", value:1}
        ,{ category:"PDS", value:1}
        ,{ category:"6 ASM + Ketogenic", value:1}
        ,{ category:"stiripentol", value:1}
        ,{ category:"RUF", value:1}
        ,{ category:"Diazepam", value:1}
        ,{ category:"steroids", value:1}
        ,{ category:"KD", value:1}
        ,{ category:"TPM (+Ketogenic diet)", value:1}
        ,{ category:"VPA LEV", value:1}
        ,{ category:"ketogenic diet", value:1}
        ,{ category:"LDC", value:1}
    ];
    amDonutChart('chartdivat7', REA_ASM);
}

const drawDuringCouse = () => {

    const AALF = [
        { category:"NA", value:542}
        ,{ category:"7y", value:25}
        ,{ category:"5y", value:23}
        ,{ category:"3y", value:19}
        ,{ category:"6y", value:16}
        ,{ category:"13y", value:16}
        ,{ category:"2.5y", value:15}
        ,{ category:"4y", value:14}
        ,{ category:"8y", value:13}
        ,{ category:"9y", value:12}
        ,{ category:"20m", value:12}
        ,{ category:"10y", value:10}
        ,{ category:"14m", value:10}
        ,{ category:"10m", value:10}
        ,{ category:"18m", value:9}
        ,{ category:"11y", value:9}
        ,{ category:"4y6m", value:8}
        ,{ category:"14y", value:8}
        ,{ category:"1y", value:8}
        ,{ category:"1y4m", value:8}
        ,{ category:">2y", value:7}
        ,{ category:"2y", value:7}
        ,{ category:"19y", value:7}
        ,{ category:"12y", value:7}
        ,{ category:"7 years", value:7}
        ,{ category:"29y", value:6}
        ,{ category:"10 months", value:6}
        ,{ category:"17y", value:6}
        ,{ category:"18y", value:6}
        ,{ category:"4 yrs", value:6}
        ,{ category:"1y6m", value:6}
        ,{ category:"1y8m", value:5}
        ,{ category:"12m", value:5}
        ,{ category:"8 yrs", value:5}
        ,{ category:"15m", value:5}
        ,{ category:"3m", value:5}
        ,{ category:"2y8m", value:5}
        ,{ category:"3 years", value:5}
        ,{ category:"9m", value:4}
        ,{ category:" 4y", value:4}
        ,{ category:"1.5y", value:4}
        ,{ category:">16y", value:4}
        ,{ category:"3y10m", value:4}
        ,{ category:"1y2m", value:4}
        ,{ category:"2y9m", value:4}
        ,{ category:"20y", value:4}
        ,{ category:"16y", value:4}
        ,{ category:"7m", value:4}
        ,{ category:"6 yrs", value:3}
        ,{ category:"6mo (CA 4mo)", value:3}
        ,{ category:"15y", value:3}
        ,{ category:"7yr 3mo", value:3}
        ,{ category:"25y", value:3}
        ,{ category:"6y3m", value:3}
        ,{ category:"30 month", value:3}
        ,{ category:"7y3m", value:3}
        ,{ category:"6yr 7mo", value:3}
        ,{ category:"4y5m", value:3}
        ,{ category:"14y11m", value:3}
        ,{ category:"11m", value:3}
        ,{ category:"5y2m", value:3}
        ,{ category:"22y", value:3}
        ,{ category:"3y3m", value:3}
        ,{ category:" 8y", value:3}
        ,{ category:"2yr", value:3}
        ,{ category:"5y11m", value:3}
        ,{ category:" 3y", value:3}
        ,{ category:"2y7m", value:3}
        ,{ category:"4 months", value:3}
        ,{ category:"8 years", value:3}
        ,{ category:"6y7m", value:3}
        ,{ category:"6y2m", value:3}
        ,{ category:"3y9m", value:3}
        ,{ category:"8m", value:3}
        ,{ category:"6y9m", value:3}
        ,{ category:"3yr", value:3}
        ,{ category:"6y11m", value:3}
        ,{ category:"2y2m", value:3}
        ,{ category:"3 yrs", value:3}
        ,{ category:"21y", value:2}
        ,{ category:"5y10m", value:2}
        ,{ category:"23y", value:2}
        ,{ category:"3.7y", value:2}
        ,{ category:"16m", value:2}
        ,{ category:"3 months", value:2}
        ,{ category:"6m", value:2}
        ,{ category:"3y7m", value:2}
        ,{ category:"4y3m", value:2}
        ,{ category:"36m", value:2}
        ,{ category:"5yrs", value:2}
        ,{ category:"2yr 3mo", value:2}
        ,{ category:"8y10m", value:2}
        ,{ category:" 6y", value:2}
        ,{ category:"na", value:2}
        ,{ category:"2y3m", value:2}
        ,{ category:"67m", value:2}
        ,{ category:"39m", value:2}
        ,{ category:"35y", value:2}
        ,{ category:"7 yrs", value:2}
        ,{ category:"8y1m", value:2}
        ,{ category:"5y3m", value:2}
        ,{ category:"1y9m", value:2}
        ,{ category:"6.5 years", value:2}
        ,{ category:"38 yrs", value:2}
        ,{ category:"8y3m", value:2}
        ,{ category:"6y1m", value:2}
        ,{ category:"6y4m", value:2}
        ,{ category:"4m", value:2}
        ,{ category:"11 years", value:2}
        ,{ category:"7 yr", value:2}
        ,{ category:"34m", value:2}
        ,{ category:"5y1m", value:2}
        ,{ category:"1y3m", value:2}
        ,{ category:"1.5 yrs", value:1}
        ,{ category:">14m", value:1}
        ,{ category:"1m", value:1}
        ,{ category:"20 yrs", value:1}
        ,{ category:"6y6m", value:1}
        ,{ category:"5y6m", value:1}
        ,{ category:"10yrs", value:1}
        ,{ category:"11 YO", value:1}
        ,{ category:"40m", value:1}
        ,{ category:"11 months", value:1}
        ,{ category:">29y", value:1}
        ,{ category:"16 mo", value:1}
        ,{ category:"21mo (deceased)", value:1}
        ,{ category:"10y6m", value:1}
        ,{ category:"14 months", value:1}
        ,{ category:"22m", value:1}
        ,{ category:"66m", value:1}
        ,{ category:">8y", value:1}
        ,{ category:"2y11m", value:1}
        ,{ category:"16mo", value:1}
        ,{ category:"12yr+", value:1}
        ,{ category:"12mo", value:1}
        ,{ category:"32 months", value:1}
        ,{ category:">4y", value:1}
        ,{ category:"5y8m", value:1}
        ,{ category:"5 yrs", value:1}
        ,{ category:"17m", value:1}
        ,{ category:"34 months", value:1}
        ,{ category:"2yr 9mo", value:1}
        ,{ category:"8yr 10mo", value:1}
        ,{ category:"18 mo", value:1}
        ,{ category:"3y11m", value:1}
        ,{ category:"7yr 6mo", value:1}
        ,{ category:"5.5yr", value:1}
        ,{ category:"42m", value:1}
        ,{ category:"7y5m", value:1}
        ,{ category:"29m", value:1}
        ,{ category:"60m", value:1}
        ,{ category:"1Y8M", value:1}
        ,{ category:"4y1m", value:1}
        ,{ category:"14 month", value:1}
        ,{ category:"9y8m", value:1}
        ,{ category:"24y", value:1}
        ,{ category:"7mo", value:1}
        ,{ category:"8 mo", value:1}
        ,{ category:"33m", value:1}
        ,{ category:"13m", value:1}
        ,{ category:"11Y", value:1}
        ,{ category:"7 mo", value:1}
        ,{ category:"2y5m", value:1}
        ,{ category:"2.5 yrs", value:1}
        ,{ category:"7y2m", value:1}
        ,{ category:"6y10m", value:1}
        ,{ category:"81 mo", value:1}
        ,{ category:"few days", value:1}
        ,{ category:"10 yrs", value:1}
        ,{ category:"21 mo", value:1}
        ,{ category:"37m", value:1}
        ,{ category:"4.5 yrs", value:1}
        ,{ category:"8y2m", value:1}
        ,{ category:"60yr", value:1}
        ,{ category:"1y 10m", value:1}
        ,{ category:"81m", value:1}
        ,{ category:"7y8m", value:1}
        ,{ category:">3y", value:1}
        ,{ category:"52y", value:1}
        ,{ category:"2.6y", value:1}
        ,{ category:"1.1y", value:1}
        ,{ category:"2m", value:1}
        ,{ category:"1yr 4mo", value:1}
        ,{ category:"3mo", value:1}
        ,{ category:"4y8m", value:1}
        ,{ category:"42y", value:1}
        ,{ category:"4y2m", value:1}
        ,{ category:"1 yr 6mo", value:1}
        ,{ category:"3y 11 months", value:1}
        ,{ category:"~1y", value:1}
        ,{ category:"16 yrs", value:1}
        ,{ category:"6 week", value:1}
        ,{ category:"1.7y", value:1}
        ,{ category:"19m", value:1}
        ,{ category:"2 yrs", value:1}
        ,{ category:"60y", value:1}
        ,{ category:"18mo", value:1}
        ,{ category:"83yr", value:1}
        ,{ category:"4.8 yrs", value:1}
        ,{ category:"13 yrs", value:1}
        ,{ category:"4y4m", value:1}
        ,{ category:"5y4m", value:1}
        ,{ category:"7y6m", value:1}
        ,{ category:"7yrs", value:1}
        ,{ category:"0.7y", value:1}
    ];
    amChartPie2('chartdivCo1', AALF);

    const DZ_TP = [
        { country:"NA", sales:625}
        ,{ country:"Multiple", sales:257}
        ,{ country:"focal", sales:120}
        ,{ country:"tonic (Ohtaharra syndrome)", sales:117}
        ,{ country:"spasms", sales:38}
        ,{ country:"hemiclonic", sales:10}
        ,{ country:"absence seizure", sales:7}
        ,{ country:"no seizure", sales:6}
        ,{ country:"hemiclonic or bilateral clonic", sales:3}
        ,{ country:"myoclonic seizure", sales:3}
    ];
    amChartPie('chartdivCo2', DZ_TP);

    const ASM_RES = [
        { country:"seizure free", value:258}
        ,{ country:"seizure >90% reduction", value:28}
        ,{ country:"undetermined", value:160}
        ,{ country:"seizure aggravation", value:31}
        ,{ country:"NA", value:703}
        ,{ country:"no seizure", value:6}

    ];
    amChartBar2('chartdivCo3', ASM_RES);

    const RES_ASM = [
        { country:"NA", sales:752}
        ,{ country:"VPA", sales:65}
        ,{ country:"LEV", sales:52}
        ,{ country:"TPM", sales:43}
        ,{ country:"OXC", sales:35}
        ,{ country:"PHT", sales:29}
        ,{ country:"PB", sales:26}
        ,{ country:"CBZ", sales:22}
        ,{ country:"LTG", sales:18}
        ,{ country:"VGB", sales:16}
        ,{ country:"CLB", sales:16}
        ,{ country:"LCS", sales:11}
        ,{ country:"CLZ", sales:8}
        ,{ country:"KD", sales:8}
        ,{ country:"Unknown", sales:6}
        ,{ country:"ZNS", sales:6}
        ,{ country:"no seizure", sales:6}
        ,{ country:"ACTH", sales:6}
        ,{ country:"MDZ", sales:5}
        ,{ country:"NZP", sales:4}
        ,{ country:"None", sales:4}
        ,{ country:"RUF", sales:3}
        ,{ country:"Ketogenic diet", sales:3}
        ,{ country:"unknown", sales:3}
        ,{ country:"na", sales:3}
        ,{ country:"LCM", sales:2}
        ,{ country:"NZ", sales:2}
        ,{ country:"self-limited", sales:2}
        ,{ country:"Pb", sales:2}
        ,{ country:"Lidocaine", sales:2}
        ,{ country:"ST(sulthiamine)", sales:1}
        ,{ country:"ST (sulthiamine)", sales:1}
        ,{ country:"ketogenic diet", sales:1}
        ,{ country:"CS(corticosteroid)", sales:1}
        ,{ country:"rectal diazepam", sales:1}
        ,{ country:"VNS", sales:1}
        ,{ country:"ketognic diet ", sales:1}
        ,{ country:"CZP", sales:1}
        ,{ country:"PDS", sales:1}
        ,{ country:"Sultiame", sales:1}
        ,{ country:"none", sales:1}
        ,{ country:"CS", sales:1}
        ,{ country:"Ketognic diet", sales:1}
        ,{ country:"CNZ", sales:1}
        ,{ country:"VPA LTG ?", sales:1}
        ,{ country:"DPH", sales:1}
        ,{ country:"Rufinamide (unknown)", sales:1}
        ,{ country:"Stiripentol", sales:1}
        ,{ country:"TMP", sales:1}
        ,{ country:"BR(bromide)", sales:1}
        ,{ country:"BR (bromide)", sales:1}
        ,{ country:"sulthiame (ST)", sales:1}
        ,{ country:"Modified Atkins Diet", sales:1}
        ,{ country:"CS(corticosteroids)", sales:1}
        ,{ country:"mexiletine", sales:1}
        ,{ country:"PER", sales:1}

    ];
    amChartPie('chartdivCo4', RES_ASM);

    const DEV_course = [
        { country:"Delay", value:521}
        ,{ country:"NA", value:403}
        ,{ country:"Normal", value:229}
        ,{ country:"undetermined", value:33}
    ];
    amChartBar1('chartdivCo5', DEV_course);

    const SFA = [
        { country:"NA", value:684}
        ,{ country:"Yes", value:298}
        ,{ country:"No", value:198}
        ,{ country:"no seizure", value:6}
    ];
    amChartBar1('chartdivCo6', SFA);

    const MAIN_PHENOTP = [
        { category:"DEE early onset", value:463}
        ,{ category:"NA", value:258}
        ,{ category:"BFINS/Self limiting", value:215}
        ,{ category:"DEE late onset", value:148}
        ,{ category:"ID/ASD/Schizophrenia", value:100}
        ,{ category:"Episodic ataxia without seizure", value:2}
    ];
    amChartPie2('chartdivCo7', MAIN_PHENOTP);

    const PHENOTP = [
        { country:"ID/ASD and seizure ", value:600}
        ,{ country:"Not available", value:258}
        ,{ country:"BFNIE", value:205}
        ,{ country:"ID/ASD without seizure", value:84}
        ,{ country:"Episodic ataxia without seizure", value:23}
        ,{ country:"Schizophrenia without seizure", value:16}

    ];
    amChartBar2('chartdivCo8', PHENOTP);
}

const drawLiterature = () => {

    const PUB_LINK = [
        { country:"https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5796785/", sales:160}
        ,{ country:"https://www.ncbi.nlm.nih.gov/pmc/articles/PMC9005871/", sales:102}
        ,{ country:"https://pubmed.ncbi.nlm.nih.gov/28379373/", sales:84}
        ,{ country:"https://www.ncbi.nlm.nih.gov/pmc/articles/PMC8257493/", sales:29}
        ,{ country:"", sales:21}
        ,{ country:"https://www.ncbi.nlm.nih.gov/pmc/articles/PMC6293633/", sales:20}
        ,{ country:"https://www.ncbi.nlm.nih.gov/pmc/articles/PMC6314000/", sales:18}
        ,{ country:"https://www.ncbi.nlm.nih.gov/pmc/articles/PMC10764033/", sales:17}
        ,{ country:"https://pubmed.ncbi.nlm.nih.gov/26291284/", sales:16}
        ,{ country:"https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4077789/", sales:16}
        ,{ country:"https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5895461/", sales:14}
        ,{ country:"https://www.ncbi.nlm.nih.gov/pmc/articles/PMC9151917", sales:14}
        ,{ country:"https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5496244/", sales:13}
        ,{ country:"https://www.ncbi.nlm.nih.gov/pmc/articles/PMC6885003/", sales:13}
        ,{ country:"https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4862068/", sales:12}
        ,{ country:"Table", sales:12}
        ,{ country:"https://www.ncbi.nlm.nih.gov/pmc/articles/PMC9816327/", sales:10}
        ,{ country:"https://www.ncbi.nlm.nih.gov/pmc/articles/PMC8075886/", sales:9}
        ,{ country:"https://academic.oup.com/brain/article/140/5/1316/3098477?login=true", sales:8}
        ,{ country:"https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4756433/", sales:8}
        ,{ country:"PMID 15048894", sales:8}
        ,{ country:"https://www.ncbi.nlm.nih.gov/pmc/articles/PMC6856296/", sales:8}
        ,{ country:"PMID: 23758435", sales:8}
        ,{ country:"https://www.sciencedirect.com/science/article/pii/S2352340918309740?via%3Dihub", sales:7}
        ,{ country:"https://www.ncbi.nlm.nih.gov/pmc/articles/PMC10696347/", sales:7}
        ,{ country:"PMID: 35431799", sales:7}
        ,{ country:"https://www.ncbi.nlm.nih.gov/pmc/articles/PMC10690684/", sales:7}
        ,{ country:"https://academic.oup.com/brain/article/140/5/1316/3098477", sales:7}
        ,{ country:"PMID: 35431799", sales:7}
        ,{ country:"https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5366084/", sales:6}
        ,{ country:"https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5945675/", sales:6}
        ,{ country:"https://www.ncbi.nlm.nih.gov/pmc/articles/PMC9205988/", sales:6}
        ,{ country:"https://www.ncbi.nlm.nih.gov/pmc/articles/PMC10767160/", sales:5}
        ,{ country:"https://www.ncbi.nlm.nih.gov/pmc/articles/PMC8417468/", sales:5}
        ,{ country:"https://www.ncbi.nlm.nih.gov/pmc/articles/PMC3704157/", sales:5}
        ,{ country:"PMID: 26645390", sales:5}
        ,{ country:"https://pubmed.ncbi.nlm.nih.gov/31506931/", sales:4}
        ,{ country:"https://www.nature.com/articles/s42003-022-03454-1", sales:4}
        ,{ country:"PMID: 20371507", sales:4}
        ,{ country:"https://pubmed.ncbi.nlm.nih.gov/30144217/", sales:4}
        ,{ country:"https://pubmed.ncbi.nlm.nih.gov/36387164/", sales:4}
        ,{ country:"https://pubmed.ncbi.nlm.nih.gov/23360469/", sales:4}
        ,{ country:"https://onlinelibrary.wiley.com/doi/full/10.1684/epd.2020.1199", sales:3}
        ,{ country:"https://pubmed.ncbi.nlm.nih.gov/35431799/", sales:3}
        ,{ country:"https://www.ncbi.nlm.nih.gov/pmc/articles/PMC7507365/", sales:3}
        ,{ country:"https://www.ncbi.nlm.nih.gov/pmc/articles/PMC8222834/", sales:3}
        ,{ country:"PMID: 23935176", sales:3}
        ,{ country:"https://pubmed.ncbi.nlm.nih.gov/24659627/", sales:3}
        ,{ country:"PMID: 34156984", sales:3}
        ,{ country:"https://www.ncbi.nlm.nih.gov/pmc/articles/PMC7656751/", sales:3}
        ,{ country:"https://pubmed.ncbi.nlm.nih.gov/25818041/", sales:3}
        ,{ country:"https://pubmed.ncbi.nlm.nih.gov/38174099/", sales:3}
        ,{ country:"https://pubmed.ncbi.nlm.nih.gov/15301839/", sales:3}
        ,{ country:"https://pubmed.ncbi.nlm.nih.gov/27397505/", sales:3}
        ,{ country:"https://doi.org/10.1093/brain/awx054", sales:3}
        ,{ country:"PMID: 11903470", sales:3}
        ,{ country:"PMID: 19786696 (same case)", sales:3}
        ,{ country:"https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5932755", sales:3}
        ,{ country:"PMID: 31205438", sales:2}
        ,{ country:"https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5613000/", sales:2}
        ,{ country:"https://jmg.bmj.com/content/jmedgenet/49/6/353.full.pdf?with-ds=yes", sales:2}
        ,{ country:"https://www.ncbi.nlm.nih.gov/pmc/articles/PMC8357555/", sales:2}
        ,{ country:"PMID: 38174099", sales:2}
        ,{ country:"https://onlinelibrary.wiley.com/doi/10.1002/humu.23619", sales:2}
        ,{ country:"PMID: 32750235PMID: 37578743", sales:2}
        ,{ country:"PMID: 26993267", sales:2}
        ,{ country:"PMID: 33013363", sales:2}
        ,{ country:"PMID: 35637276", sales:2}
        ,{ country:"https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4544753/", sales:2}
        ,{ country:"https://jmg.bmj.com/content/53/5/310.long", sales:2}
        ,{ country:"https://pubmed.ncbi.nlm.nih.gov/37578743/", sales:2}
        ,{ country:"https://pubmed.nacbi.nlm.nih.gov/38544375", sales:2}
        ,{ country:"https://www.ncbi.nlm.nih.gov/pmc/articles/PMC8409681/", sales:2}
        ,{ country:"https://pubmed.ncbi.nlm.nih.gov/35637276/", sales:2}
        ,{ country:"https://www.sciencedirect.com/science/article/pii/S0006322317300410", sales:2}
        ,{ country:"PMID: 15048894", sales:2}
        ,{ country:"https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5104192/", sales:2}
        ,{ country:"https://www.ncbi.nlm.nih.gov/pmc/articles/PMC8458055/", sales:2}
        ,{ country:"https://www.frontiersin.org/articles/10.3389/fnmol.2022.809951/full", sales:2}
        ,{ country:"https://pubmed.ncbi.nlm.nih.gov/27867041/", sales:2}
        ,{ country:"https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5023942/", sales:2}
        ,{ country:"https://onlinelibrary.wiley.com/doi/10.1111/j.1528-1167.2007.01049.x", sales:2}
        ,{ country:"https://pubmed.ncbi.nlm.nih.gov/30619928/", sales:2}
        ,{ country:"https://www.ncbi.nlm.nih.gov/pmc/articles/PMC11110365", sales:2}
        ,{ country:"https://www.frontiersin.org/journals/pediatrics/articles/10.3389/fped.2021.635703/full", sales:2}
        ,{ country:"doi.org/10.26815/acn.2022.00325 (DOI used because there is no PMID)", sales:2}
        ,{ country:" PMID38939966", sales:2}
        ,{ country:"PMID: 28837158", sales:2}
        ,{ country:"https://pubmed.ncbi.nlm.nih.gov/26311622/", sales:2}
        ,{ country:"https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4479194/", sales:2}
        ,{ country:"https://pubmed.ncbi.nlm.nih.gov/34986624/", sales:2}
        ,{ country:"PMID: 19783390", sales:2}
        ,{ country:"PMID: 33531663", sales:2}
        ,{ country:"PMID: 38939966", sales:2}
        ,{ country:"https://www.ncbi.nlm.nih.gov/pmc/articles/PMC7428836/", sales:2}
        ,{ country:"PMID: 33013363", sales:2}
        ,{ country:"PMID: 32400968", sales:2}
        ,{ country:"https://journals.lww.com/psychgenetics/fulltext/2019/06000/understanding_the_schizophrenia_phenotype_in_the.4.aspx", sales:2}
        ,{ country:"https://europepmc.org/article/med/29614566", sales:2}
        ,{ country:"https://pubmed.ncbi.nlm.nih.gov/36865317/", sales:2}
        ,{ country:"https://onlinelibrary.wiley.com/doi/10.1111/j.1528-1167.2006.00392.x", sales:2}
        ,{ country:"https://www.ncbi.nlm.nih.gov/pmc/articles/PMC3375064/", sales:2}
        ,{ country:"https://pubmed.ncbi.nlm.nih.gov/38539105/", sales:2}
        ,{ country:"PMID: 23988467", sales:2}
        ,{ country:"https://www.ncbi.nlm.nih.gov/pmc/articles/PMC6965773/", sales:2}
        ,{ country:"https://www.sciencedirect.com/science/article/pii/S1090379814000609?via%3Dihub", sales:2}
        ,{ country:"https://academic.oup.com/brain/article/140/5/1316/3098477?login=false", sales:1}
        ,{ country:"https://academic-oup-com-ssl.libproxy.snu.ac.kr/brain/article/140/5/1316/3098477?login=true#91047870", sales:1}
        ,{ country:"https://www.ncbi.nlm.nih.gov/pmc/articles/PMC6391808/", sales:1}
        ,{ country:"https://pubmed.ncbi.nlm.nih.gov/34874093/", sales:1}
        ,{ country:"PMID: 31054490", sales:1}
        ,{ country:"PMID: 37429183", sales:1}
        ,{ country:"https://www.frontiersin.org/files/Articles/437310/fneur-10-00434-HTML/image_m/fneur-10-00434-t002.jpg", sales:1}
        ,{ country:"PMID: 33731876 (red is main, the others are reviews)", sales:1}
        ,{ country:"https://onlinelibrary.wiley.com/doi/10.1111/gbb.12456", sales:1}
        ,{ country:"https://journals.lww.com/psychgenetics/fulltext/2016/04000/mutation_screening_of_scn2a_in_schizophrenia_and.2.aspx", sales:1}
        ,{ country:"https://www.sciencedirect.com/science/article/pii/S1873506119301187", sales:1}
        ,{ country:"https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5932755/", sales:1}
        ,{ country:"https://pubmed.ncbi.nlm.nih.gov/12243921/", sales:1}
        ,{ country:"PMID: 25937001", sales:1}
        ,{ country:"https://pubmed.ncbi.nlm.nih.gov/38564633/", sales:1}
        ,{ country:"PMID: 25232683", sales:1}
        ,{ country:"PMID: 30619928", sales:1}
        ,{ country:"https://www.ncbi.nlm.nih.gov/pmc/articles/PMC7765181/", sales:1}
        ,{ country:"https://pubmed.ncbi.nlm.nih.gov/28761347", sales:1}
        ,{ country:"https://www.sciencedirect.com/science/article/pii/S1525505020303668?via%3Dihub", sales:1}
        ,{ country:"https://pubmed.ncbi.nlm.nih.gov/26555645/", sales:1}
        ,{ country:"https://academic.oup.com/brain/article/133/5/1403/543123?login=true", sales:1}
        ,{ country:"PMID: 23550958", sales:1}
        ,{ country:"PMID: 27159988", sales:1}
        ,{ country:"https://iap-kpj.org/epileptic-spasms-west-syndrome-secondary-to-dravet-syndrome-due-to-gene-mutation-from-india/", sales:1}
        ,{ country:"PMID: 35053762", sales:1}
        ,{ country:"https://pubmed.ncbi.nlm.nih.gov/24710820/", sales:1}
        ,{ country:"PMID35431799", sales:1}
        ,{ country:"PMID: 33779092", sales:1}
        ,{ country:"https://doi.org/10.1002/epi4.12673", sales:1}
        ,{ country:"https://onlinelibrary.wiley.com/doi/10.1002/mgg3.2269", sales:1}
        ,{ country:"https://www.cell.com/neuron/pdf/S0896-6273(23)00470-1.pdf", sales:1}
        ,{ country:"https://www.ncbi.nlm.nih.gov/pmc/articles/PMC7338758/", sales:1}
        ,{ country:"https://www.frontiersin.org/journals/molecular-neuroscience/articles/10.3389/fnmol.2022.809951/full", sales:1}
        ,{ country:"https://pubmed.ncbi.nlm.nih.gov/30185235/", sales:1}
        ,{ country:"https://pubmed.ncbi.nlm.nih.gov/22912592/", sales:1}
        ,{ country:"https://www.ncbi.nlm.nih.gov/pmc/articles/PMC10952465/", sales:1}
        ,{ country:"https://pubmed.ncbi.nlm.nih.gov/38778310/", sales:1}
        ,{ country:"Text", sales:1}
        ,{ country:"https://www.ncbi.nlm.nih.gov/pmc/articles/PMC9034667/", sales:1}
        ,{ country:"https://link.springer.com/article/10.1186/s13256-019-2203-8", sales:1}
        ,{ country:"https://www.ncbi.nlm.nih.gov/pmc/articles/PMC7461817/", sales:1}
        ,{ country:"https://onlinelibrary.wiley.com/doi/10.1684/epd.2020.1199", sales:1}
        ,{ country:"https://www.ncbi.nlm.nih.gov/pmc/articles/PMC7039996/", sales:1}
        ,{ country:"https://pubmed.ncbi.nlm.nih.gov/32193494/", sales:1}
        ,{ country:"https://pubmed.ncbi.nlm.nih.gov/19786696", sales:1}
        ,{ country:"https://www.sciencedirect.com/science/article/pii/S0387760418300901?via%3Dihub", sales:1}
        ,{ country:"https://pubmed.ncbi.nlm.nih.gov/29625812/", sales:1}
        ,{ country:"PMID: 31780880", sales:1}
        ,{ country:"https://www.nature.com/articles/s41439-018-0019-5", sales:1}
        ,{ country:"https://pubmed.ncbi.nlm.nih.gov/32603808/", sales:1}
        ,{ country:"https://journals.lww.com/cmj/fulltext/2018/09200/successful_adaptation_of_targeted_gene_panel.27.aspx", sales:1}
        ,{ country:"https://onlinelibrary.wiley.com/doi/10.1002/ana.24883", sales:1}
        ,{ country:"https://www.sciencedirect.com/science/article/pii/S1098360021018542", sales:1}
        ,{ country:"PMID: 37583270", sales:1}
        ,{ country:"https://doi.org/10.1111/epi.12241", sales:1}
        ,{ country:"PMID: 26291284", sales:1}
        ,{ country:"https://pubmed.ncbi.nlm.nih.gov/33951346/", sales:1}
        ,{ country:"text", sales:1}
        ,{ country:"https://pubmed.nacbi.nlm.nih.gov/35431799", sales:1}
        ,{ country:"https://pubmed.nacbi.nlm.nih.gov/37583270", sales:1}
        ,{ country:"https://www.thieme-connect.com/products/ejournals/html/10.1055/s-0041-1727097?casa_token=oyJX0z_FvTsAAAAA:X4RhnDxvC1Jal4JHLnC3vAX0vW7H_TflfDmgokM8iSzuVDPWe89BrWaudfzm2YZ6tj6HZ5MhWdwqLNtZLQ", sales:1}
        ,{ country:"PMID:30619928", sales:1}
        ,{ country:"PMID: 30048009", sales:1}
        ,{ country:"PMID: 27876397", sales:1}
        ,{ country:"https://pubmed.ncbi.nlm.nih.gov/27781028/", sales:1}
        ,{ country:"https://www-sciencedirect-com-ssl.libproxy.snu.ac.kr/science/article/pii/S0387760417301729?via%3Dihub", sales:1}
        ,{ country:"https://pubmed.ncbi.nlm.nih.gov/15028761/", sales:1}
        ,{ country:"https://onlinelibrary.wiley.com/doi/10.1002/epi4.12811", sales:1}
        ,{ country:"https://pubmed.ncbi.nlm.nih.gov/37152433", sales:1}
        ,{ country:"https://pubmed.ncbi.nlm.nih.gov/11371648/", sales:1}
        ,{ country:"https://link.springer.com/article/10.1007/s00415-015-7984-0", sales:1}
        ,{ country:"NA", sales:1}
        ,{ country:"PMID: 36571524", sales:1}
        ,{ country:"PMID: 23827426", sales:1}
        ,{ country:"https://www.science.org/doi/10.1126/scitranslmed.3010076", sales:1}
        ,{ country:"https://www.sciencedirect.com/science/article/pii/S0378111923009125", sales:1}
        ,{ country:"https://www.sciencedirect.com/science/article/pii/S0387760414002563", sales:1}
        ,{ country:"https://doi.org/10.1016/S0140-6736(02)09968-3", sales:1}
        ,{ country:"PMID32400968", sales:1}
        ,{ country:"PMID: 25839129", sales:1}
        ,{ country:"https://www.ncbi.nlm.nih.gov/pmc/articles/PMC6408085/", sales:1}
        ,{ country:"https://doi.org/10.1212/WNL.0b013e3182a43e57", sales:1}
        ,{ country:"supplemenatry material", sales:1}
        ,{ country:"PMID: 34093402", sales:1}
        ,{ country:"https://www.ncbi.nlm.nih.gov/pmc/articles/PMC7336724/", sales:1}
        ,{ country:"PMID: 37267104", sales:1}
        ,{ country:"https://www.nature.com/articles/s41431-023-01425-6", sales:1}
        ,{ country:"https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5073623/", sales:1}
        ,{ country:"https://www.medrxiv.org/content/10.1101/2023.02.23.23286378v1.full.pdf", sales:1}
        ,{ country:"https://pubmed.ncbi.nlm.nih.gov/35053762/", sales:1}
        ,{ country:"https://www.jneurosci.org/content/24/11/2690", sales:1}
        ,{ country:"https://onlinelibrary.wiley.com/doi/10.1111/epi.13020", sales:1}
        ,{ country:"https://pubmed.ncbi.nlm.nih.gov/23988467/", sales:1}
        ,{ country:"https://doi.org/10.1038/gim.2017.114", sales:1}
        ,{ country:"https://doi.org/10.1016/j.neuroscience.2019.08.016", sales:1}
        ,{ country:"https://pubmed.ncbi.nlm.nih.gov/26647175/", sales:1}
        ,{ country:"https://pubmed.ncbi.nlm.nih.gov/26648591/ ", sales:1}
        ,{ country:"(duplicate)https://pubmed.ncbi.nlm.nih.gov/19786696/", sales:1}
        ,{ country:"https://www.ncbi.nlm.nih.gov/pmc/articles/PMC7081304/", sales:1}
        ,{ country:"https://pubmed.ncbi.nlm.nih.gov/23708187/", sales:1}
        ,{ country:"https://pubmed.ncbi.nlm.nih.gov/28569743/", sales:1}
        ,{ country:"PMID: 35715422", sales:1}
        ,{ country:"https://www.ncbi.nlm.nih.gov/pmc/articles/PMC10026144/", sales:1}
        ,{ country:"https://journals.sagepub.com/doi/10.1177/2329048X231163944?url_ver=Z39.88-2003&rfr_id=ori:rid:crossref.org&rfr_dat=cr_pub%20%200pubmed", sales:1}
        ,{ country:"https://www.ncbi.nlm.nih.gov/pmc/articles/PMC7389238/", sales:1}
        ,{ country:"https://www.ncbi.nlm.nih.gov/pmc/articles/PMC10076746/     ", sales:1}
        ,{ country:"https://onlinelibrary.wiley.com/doi/10.1111/epi.12554", sales:1}
        ,{ country:"https://pubmed.ncbi.nlm.nih.gov/38651838/", sales:1}
        ,{ country:"PMID: 22612257", sales:1}
        ,{ country:"https://pubmed.ncbi.nlm.nih.gov/32291436/", sales:1}
        ,{ country:"https://www.ncbi.nlm.nih.gov/pmc/articles/PMC7423163/", sales:1}
        ,{ country:"https://www.mdpi.com/1422-0067/19/10/3113", sales:1}
        ,{ country:"PMID: 38059254", sales:1}
        ,{ country:"https://www.sciencedirect.com/science/article/pii/S1096719215300780?via%3Dihub", sales:1}
        ,{ country:"https://www.frontiersin.org/journals/neurology/articles/10.3389/fneur.2021.653517/full", sales:1}
        ,{ country:"https://pubmed.ncbi.nlm.nih.gov/22591750/", sales:1}
        ,{ country:"https://pubmed.ncbi.nlm.nih.gov/25459969/", sales:1}
        ,{ country:"PMID: 28263302", sales:1}
        ,{ country:"https://pubmed.ncbi.nlm.nih.gov/24463883", sales:1}
        ,{ country:"https://pubmed.ncbi.nlm.nih.gov/32579932/", sales:1}
        ,{ country:"https://pubmed.ncbi.nlm.nih.gov/38113761/", sales:1}
        ,{ country:"https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5632818/", sales:1}
        ,{ country:"https://pubmed.ncbi.nlm.nih.gov/28709814/", sales:1}
        ,{ country:"https://www.jle.com/fr/revues/epd/e-docs/confirming_an_expanded_spectrum_of_scn2a_mutations_a_case_series_301201/article.phtml?tab=texte", sales:1}
        ,{ country:"https://pubmed.ncbi.nlm.nih.gov/37010102/", sales:1}
        ,{ country:"https://pubmed.ncbi.nlm.nih.gov/38113761", sales:1}
        ,{ country:"https://www.neurology.org/doi/full/10.1212/WNL.0b013e3182a43e57", sales:1}
        ,{ country:"https://www.sciencedirect.com/science/article/pii/S1525505020305011", sales:1}
        ,{ country:"https://www.sciencedirect.com/science/article/pii/S2589986420300459", sales:1}
        ,{ country:"https://pubmed.ncbi.nlm.nih.gov/30977854/", sales:1}
        ,{ country:"https://pubmed.ncbi.nlm.nih.gov/25772804/", sales:1}
        ,{ country:"https://www.neurology.org/doi/10.1212/WNL.0b013e3182a43e57?url_ver=Z39.88-2003&rfr_id=ori:rid:crossref.org&rfr_dat=cr_pub%20%200pubmed", sales:1}
        ,{ country:"file:///C:/Users/82900/Downloads/jmedgenet-2016-May-53-5-310-inline-supplementary-material-1.pdf", sales:1}
        ,{ country:"https://onlinelibrary.wiley.com/doi/full/10.1002/ajmg.a.62595", sales:1}
        ,{ country:"https://onlinelibrary.wiley.com/doi/full/10.1111/cge.13556", sales:1}
        ,{ country:"https://pubmed.ncbi.nlm.nih.gov/33770503/", sales:1}
        ,{ country:"https://www.thieme-connect.com/products/ejournals/html/10.1055/s-0038-1668141", sales:1}
        ,{ country:"PMID25457084", sales:1}
        ,{ country:"https://pubmed.ncbi.nlm.nih.gov/26934580/", sales:1}
        ,{ country:"https://pubmed.ncbi.nlm.nih.gov/29535388/", sales:1}
        ,{ country:"PMID: 24710820", sales:1}
        ,{ country:"PMID: 33903184", sales:1}
        ,{ country:"https://pubmed.ncbi.nlm.nih.gov/28256214/", sales:1}
        ,{ country:"https://www.ncbi.nlm.nih.gov/pmc/articles/PMC3868437/", sales:1}
        ,{ country:"https://pubmed.ncbi.nlm.nih.gov/34732400/", sales:1}
        ,{ country:"https://pubmed.ncbi.nlm.nih.gov/29448117/", sales:1}
        ,{ country:"https://www.sciencedirect.com/science/article/pii/S1098360021050280?via%3Dihub", sales:1}
        ,{ country:"PMID: 17386050", sales:1}
        ,{ country:"https://journals.lww.com/md-journal/FullText/2019/02220/Novel_SCN2A_mutation_in_a_family_associated_with.99.aspx", sales:1}
        ,{ country:"PMID31780822", sales:1}
        ,{ country:"https://pubmed.ncbi.nlm.nih.gov/30202019/", sales:1}
        ,{ country:"PMID: 31511657", sales:1}
    ];
    amChartPie('chartdivLit1', PUB_LINK);

    const PUB_TEST = [
        { country:"NA", value:690}
        ,{ country:"LOF", value:118}
        ,{ country:"GOF", value:94}
        ,{ country:"Mixed", value:73}
        ,{ country:"GoF", value:46}
    ];
    amChartBar2('chartdivLit2', PUB_TEST);

    const TEST_LINK = [
        { country:"", sales:479}
        ,{ country:"https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5796785/", sales:243}
        ,{ country:"https://academic.oup.com/brain/article/147/8/2761/7656659", sales:85}
        ,{ country:"https://www.ncbi.nlm.nih.gov/pmc/articles/PMC10424433/", sales:58}
        ,{ country:"NA", sales:33}
        ,{ country:"https://www.ncbi.nlm.nih.gov/pmc/articles/PMC9151917", sales:22}
        ,{ country:"PMID: 18479388", sales:6}
        ,{ country:"https://pubmed.ncbi.nlm.nih.gov/30144217/", sales:6}
        ,{ country:"PMID: 20371507", sales:6}
        ,{ country:"PMID: 34156984", sales:6}
        ,{ country:"PMID: 33531663", sales:5}
        ,{ country:"https://www.ncbi.nlm.nih.gov/pmc/articles/PMC6795554/", sales:4}
        ,{ country:"https://www.nature.com/articles/s42003-022-03454-1", sales:3}
        ,{ country:"PMID: 17021166", sales:3}
        ,{ country:"PMID: 32400968", sales:3}
        ,{ country:"https://www.ncbi.nlm.nih.gov/pmc/articles/PMC10158977/", sales:3}
        ,{ country:"https://molmed.biomedcentral.com/articles/10.1186/s10020-019-0073-6", sales:3}
        ,{ country:"PMID: 29691040 (red is main, the others are reviews)", sales:3}
        ,{ country:"PMID: 35637276", sales:3}
        ,{ country:"PMID: 19786696", sales:3}
        ,{ country:"PMID: 34093402", sales:2}
        ,{ country:"https://www.neurology.org/doi/full/10.1212/WNL.0b013e3181f8812e", sales:2}
        ,{ country:"https://pubmed.ncbi.nlm.nih.gov/15028761/", sales:2}
        ,{ country:"https://www.ncbi.nlm.nih.gov/pmc/articles/PMC7054859/", sales:2}
        ,{ country:"https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4126848/", sales:2}
        ,{ country:"PMID32400968", sales:2}
        ,{ country:"PMID: 30048009", sales:2}
        ,{ country:"PMID: 25232683", sales:2}
        ,{ country:"PMID: 22677033", sales:2}
        ,{ country:"https://rupress.org/jgp/article/152/3/e201912442/133672/Alternative-splicing-potentiates-dysfunction-of", sales:2}
        ,{ country:"https://www.pnas.org/doi/10.1073/pnas.1800077115?url_ver=Z39.88", sales:2}
        ,{ country:"PMID: 17467289", sales:2}
        ,{ country:"https://academic.oup.com/brain/advance-article/doi/10.1093/brain/awae213/7700937?login=true", sales:2}
        ,{ country:"PMID38939966", sales:2}
        ,{ country:"https://www.frontiersin.org/journals/neurology/articles/10.3389/fneur.2021.653517/full", sales:2}
        ,{ country:"https://pubmed.ncbi.nlm.nih.gov/31558572/2003&rfr_id=ori:rid:crossref.org&rfr_dat=cr_pub%20%200pubmed", sales:2}
        ,{ country:"https://pubmed.ncbi.nlm.nih.gov/22677033/", sales:2}
        ,{ country:"https://academic.oup.com/brain/article/140/5/1316/3098477", sales:2}
        ,{ country:"https://rupress.org/jgp/article/155/10/e202313375/276183/Epilepsy-associated-SCN2A-NaV1-2-variants-exhibit", sales:2}
        ,{ country:"PMID: 38939966", sales:1}
        ,{ country:"https://www.ncbi.nlm.nih.gov/pmc/articles/PMC9433730/", sales:1}
        ,{ country:"PMID: 32750235 PMID: 37578743", sales:1}
        ,{ country:"PMID: 37267104", sales:1}
        ,{ country:"https://onlinelibrary.wiley.com/doi/10.1002/humu.23619", sales:1}
        ,{ country:"PMID: 34093402", sales:1}

    ];
    amChartPie('chartdivLit3', TEST_LINK);

}

const SUMMARY_VARIANT_COLOR_MAP = {
    Missense: 0x7B68B5,
    Synonymous: 0x6FB7A8,
    'Frame shift': 0xF2AA6B,
    'Stop codon': 0xA95A52,
    Intronic: 0x9FA1A6,
    Unspecified: 0xD9D9D9
};

const SUMMARY_SEX_COLOR_MAP = { Female: 0xD9899B, Male: 0x6C8EBF, 'Not recorded': 0xD9D9D9 };

const drawSummary = (data) => {

    hcMainHBar('mainChartGene', data.chart_gene_counts);
    hcMainArea('mainChartAge', data.chart_age_months);
    hcBar('mainChartOnsetCl', data.chart_onset_cl, { mainStyle: true, yTitle: 'Number of samples' });
    hcMainRose('mainChartPheno', data.chart_phenotype);
    hcPie('mainChartdiv2', data.chart_variant, { innerRadius: 50, size: 120, legend: 'right', colorMap: SUMMARY_VARIANT_COLOR_MAP, centerLabel: 'variants' });
    hcPie('mainChartSex', data.chart_sex, { innerRadius: 50, size: 120, legend: 'right', colorMap: SUMMARY_SEX_COLOR_MAP, centerLabel: 'samples' });
}

const drawSearchGeneSummary = (data) => {

    const toPie = (arr) => arr.map(d => ({ country: d.country !== undefined ? d.country : d.category, sales: d.sales !== undefined ? d.sales : d.value }));
    if (data.chart_onset_age && data.chart_onset_age.length) {
        hcBar('chartSlOnsetAge', toPie(data.chart_onset_age), { horizontal: false, margins: { marginTop: 50, marginBottom: 40, marginLeft: 8, marginRight: 8 } });
    }
    if (data.chart_fu_age && data.chart_fu_age.length) {
        hcPie('chartSlFuAge', toPie(data.chart_fu_age), { innerRadius: 0, columns: 2 });
    }
    if (data.chart_phenotype && data.chart_phenotype.length) {
        hcBar('chartSlPhenotype', toPie(data.chart_phenotype), { horizontal: true, margins: { marginTop: 44, marginBottom: 44, marginLeft: 122, marginRight: 40 } });
    }
    if (data.chart_pub_link && data.chart_pub_link.length) {
        hcPie('chartSlPubLink', toPie(data.chart_pub_link), { innerRadius: 50, columns: 2 });
    }
}
