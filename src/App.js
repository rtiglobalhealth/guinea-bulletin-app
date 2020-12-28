import React from 'react'
import { useDataQuery, useConfig } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import classes from './App.module.css'
import './locales'
import { Button, SingleSelectOption } from '@dhis2/ui-core'
import { SingleSelectField } from '@dhis2/ui-widgets'

import { init, getManifest } from 'd2';


import { getStyle } from "./styles";

import PizZip from 'pizzip';
import PizZipUtils from 'pizzip/utils'
import Docxtemplater from 'docxtemplater';
import { saveAs } from 'file-saver';

import "react-step-progress-bar/styles.css";
import { ProgressBar } from "react-step-progress-bar";

const TEMPLATE_FORMATTED = "formatted";
const TEMPLATE_UNFORMATTED = "unformatted";

const axios = require('axios');
const Stream = require("stream").Transform;
const https = require("https");
const StyleModule = require("./style-es6");
const styleModule = new StyleModule();

const data = { image: "https://guinea-malaria-maps.herokuapp.com/static/totalconfirmed.png"}


function base64DataURLToArrayBuffer(dataURL) {
    const base64Regex = /^data:image\/(png|jpg|svg|svg\+xml);base64,/;
    if (!base64Regex.test(dataURL)) {
        return false;
    }
    const stringBase64 = dataURL.replace(base64Regex, "");
    let binaryString;
    if (typeof window !== "undefined") {
        binaryString = window.atob(stringBase64);
    } else {
        binaryString = Buffer.from(stringBase64, "base64").toString("binary");
    }
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        const ascii = binaryString.charCodeAt(i);
        bytes[i] = ascii;
    }
    return bytes.buffer;
}
const imageOpts = {
    getImage(tag) {
        return base64DataURLToArrayBuffer(tag);
    },
    getSize() {
        return [600, 450];
    },
};


const ImageModule = require("./image-es6");
const imageModule = new ImageModule(imageOpts);


function getHttpData(url, callback) {
	https
		.request(url, function (response) {
			if (response.statusCode !== 200) {
				return callback(
					new Error(
						`Request to ${url} failed, status code: ${response.statusCode}`
					)
				);
			}

			const data = new Stream();
			response.on("data", function (chunk) {
				data.push(chunk);
			});
			response.on("end", function () {
				callback(null, data.read());
			});
			response.on("error", function (e) {
				callback(e);
			});
		})
		.end();
}

function initializeDistrictData(indicatorUIDArray){

    var table = {};

    for (const indicatorUID of indicatorUIDArray) {

        //these are the distircts
        table["q1zvw5TOnZF."+indicatorUID] = "0";
        table["q1zvw5TOnZF."+indicatorUID] = "0";
        table["L1Gr2bAsR4T."+indicatorUID] = "0";
        table["THgRhO9eF0I."+indicatorUID] = "0";
        table["KnR8IiGoSxQ."+indicatorUID] = "0";
        table["GUSZlo8f9t8."+indicatorUID] = "0";
        table["mqBP8r7CwKc."+indicatorUID] = "0";
        table["IPv04VSahDi."+indicatorUID] = "0";
        table["gHO8qPxfLdl."+indicatorUID] = "0";
        table["VyZGMioVY5z."+indicatorUID] = "0";
        table["qmVkCsfziWM."+indicatorUID] = "0";
        table["CXHCAlP68L5."+indicatorUID] = "0";
        table["jiGkwTWpBeq."+indicatorUID] = "0";
        table["Motdz3Bql7L."+indicatorUID] = "0";
        table["khK0Ewyw0vV."+indicatorUID] = "0";
        table["cbst9kz3DHp."+indicatorUID] = "0";
        table["Z71gNmPnc22."+indicatorUID] = "0";
        table["zmSjEUspuVL."+indicatorUID] = "0";
        table["VUj3PJpzty8."+indicatorUID] = "0";
        table["HC3N6HbSdfg."+indicatorUID] = "0";
        table["pChTVBEAPJJ."+indicatorUID] = "0";
        table["kVULorkd7Vt."+indicatorUID] = "0";
        table["dkWnjo1bSrU."+indicatorUID] = "0";
        table["E1AAcXV9PxL."+indicatorUID] = "0";
        table["QL7gnB6sSLA."+indicatorUID] = "0";
        table["GuePjEvd6OH."+indicatorUID] = "0";
        table["TEjr8hbfz9a."+indicatorUID] = "0";
        table["zJZspSfD06r."+indicatorUID] = "0";
        table["LyGsnnzEabg."+indicatorUID] = "0";
        table["ISZZ5m7PYAC."+indicatorUID] = "0";
        table["CoKlGkkiN4a."+indicatorUID] = "0";
        table["jIFb011EBWB."+indicatorUID] = "0";
        table["yvJVq1GjI2A."+indicatorUID] = "0";
        table["ASu054HjT5Y."+indicatorUID] = "0";
        table["D5WJbugzg9L."+indicatorUID] = "0";
        table["QZJuFnb2WZ6."+indicatorUID] = "0";
        table["XraGmJ5tF7e."+indicatorUID] = "0";
        table["C4dKrWoT5au."+indicatorUID] = "0";
        table["PCa6e3khx5E."+indicatorUID] = "0";

    }

    return table;
}



export default class BulletinApp extends React.Component {

    constructor(props, context) {
        super(props);
        this.state = {
            month: "01",
            year: "2019",
            percent_done: 0
        }; 
    
        getManifest('manifest.webapp')
            .then((manifest) => {
                const mybaseUrl = manifest.getBaseUrl();
                //config.baseUrl = `${baseUrl}/api/26`;
                console.log('Loading: ${baseUrl}/api');

                init({ baseUrl: mybaseUrl+'/api/' })
                .then(d2 => {
                    console.log("d2 is ready");
                    this.state.d2 = d2;

                });
            });

        
    }
    
    updateyear(event){
        this.setState({year: event.selected});
        console.log("updated the year");
    }

    updatemonth(event){
        
        this.setState({month: event.selected});
        console.log("updated the month");
    }
    


     /* templates can be TEMPLATE_FORMATTED or TEMPLATE_UNFORMATTED*/
     generateBulletin(template) {

         var d2 = this.state.d2;
         this.setState({ percent_done: 0 });
         
         var period = this.state.year+this.state.month;

        
         // Set Month Name
         var month_name = ""
        if (this.state.month == "01"){
            month_name = i18n.t('January');
        }
        var month_obj = {
            month_name: month_name,
            month_num: this.state.month};
        var year_obj = {year: this.state.year};


         console.log("this is the date: " + period );
         console.log("this is the template: " + template );


         const reporting_rates = new d2.analytics.request()
            .addDataDimension([
                'no9OnzE3Yy7', //complétude
                'yM51VVWhtk3' ]) //promptitude
            .addPeriodDimension([period])
            .addOrgUnitDimension([
                'D1rT7FToSE4', // Kankan
                'yTNEihLzQwC', // Kindia
                'zy5MQM2PlKb', // Labé
                'QrHKMLcRSCA', // Faranah
                'odY5MzWb1jc', // Conakry
                'ZSEW310Xy6l', // Mamou
                'ysKioL4gVnV', // Nzérékoré
                'fxtOlL8b8mb', // Boké
                'Ky2CzFdfBuO', // Guinea
        ]);

        //const d2Analytics = this.props.d2.analytics.request();
        const table1 = new d2.analytics.request()
            .addDataDimension([
                'qYH6Tw7wSJr', // Palu cas consultations toutes causes confondues
                'xxMXZDNQhc1', // Palu cas suspects 
                'C8uzbGBV5Ba', //Palu cas testés
                'ZGVY1P1NNTu', //Palu cas confirmés 
                'D0tVMBr7pne', //Palu cas simples traités 
                'JcnnmqH9TTa',  //Palu cas graves traités 
                'MW5F0uImS24', //Palu Total Déces
                'no9OnzE3Yy7', //complétude
                'yM51VVWhtk3']) //promptitude
            .addPeriodDimension([period])
            .addOrgUnitDimension(['Ky2CzFdfBuO']);

        const table3 = new d2.analytics.request()
            .addDataDimension([
                'no9OnzE3Yy7', //Complétude
                'Ih6HJlhmY5d', // % de diagnostic
                'PifhiFgcyq1', // % de traitement
                'zAhqn2Vwacr', //% de TPI3  
                'PifhiFgcyq1',   //% de confirmation
                'MW5F0uImS24', //Palu Total Déces
                'kNmu11OsuGn', // Palu/Toutes Consultations
                'nnk0OcCQJm5', // Mois de Stock - TDR
                'qUdyYqApz8R',// Mois de Stock - ACT
                'lno8U7t5TLI', // Mois de Stock - SP
                // ART
                //MILDA
        ]).addPeriodDimension([period])
            .addOrgUnitDimension(['Ky2CzFdfBuO'])
            .addOrgUnitDimension(['LEVEL-3']);

        // Get the data
        d2.analytics.aggregate
            .get(reporting_rates)
            .then(function(reporting_rate_results) {
                
                console.log("retrieving " +reporting_rate_results.rows.length + " rows for the reporting rates");
            
                this.setState({ percent_done: 20 });

                var reporting_table = {};

                //shove all this into a object for reading later.
                for (var i = 0; i < reporting_rate_results.rows.length; i++) {
                    var dataelement = reporting_rate_results.rows[i];
                    reporting_table[ dataelement[1]+"."+dataelement[0] ] = dataelement[3]; 
                }

                // Get data for table I
                d2.analytics.aggregate
                .get(table1)
                .then(function(table1_results) {

                    var table1_data = {};
                    console.log("retrieving " +table1_results.rows.length + " rows for Table I");

                    this.setState({ percent_done: 40 });

                    //shove all this into a object for reading later.
                    for (var i = 0; i < table1_results.rows.length; i++) {
                        var dataelement = table1_results.rows[i];
                        table1_data[ dataelement[0] ] = dataelement[3]; 
                    }
                  
                    // Get data for table II (Taux d'incidence )
                    d2.Api.getApi()
                    .get('/analytics?dimension=dx:mH24Ynkgo4K,ou:Ky2CzFdfBuO;LEVEL-5&filter=pe:201901&order=DESC&showHierarchy=true')
                    .then(function(table2_results) {

                        console.log("retrieving " +table2_results.rows.length + " rows for Table II");
                       
                        this.setState({ percent_done: 50 });

                        var table2_data = {};

                        var j = 1;
                        //shove all this into a object for reading later.
                        for (var i = 0; i < table2_results.rows.length; i++) {
                            
                            var dataelement = table2_results.rows[i];
                            
                            if (dataelement[2] != "Infinity"){
                                // LOook up the facility name
                                var outstring = table2_results['metaData']['ouNameHierarchy'][dataelement[1]];
                                var parts = outstring.split("/");
                                table2_data["hc"+j+"_name"] = parts[5];
                                // Look up the district name
                                table2_data["hc"+j+"_district"] = parts[3];  
                                table2_data["hc"+j+"_incidence"] = dataelement[2]; 
                                j++;
                            }

                        }
                        
                        // Get data for table III
                        d2.analytics.aggregate
                        .get(table3)
                        .then(function(table3_results) {

                            var table3_data = {};
                            var table3_styles = {};

                            //initialize this (this is empty sometimes) for MW5F0uImS24
                            table3_data = initializeDistrictData(["MW5F0uImS24","nnk0OcCQJm5"]); 

                            console.log("retrieving " +table3_results.rows.length + " rows for Table III");
                            console.log(table3_results);

                            this.setState({ percent_done: 60 });

                             //shove all this into a object for later.
                            for (var i = 0; i < table3_results.rows.length; i++) {
                                var dataelement = table3_results.rows[i];
                                table3_data[ dataelement[1]+"."+dataelement[0] ] = dataelement[3];
                            
                                var style = getStyle(dataelement[0],dataelement[3]);
                                table3_styles["s_"+dataelement[1]+"."+dataelement[0]] = style;

                            }  
                            
                            var bulletin_data = Object.assign({},month_obj,year_obj, table1_data,table2_data,table3_data, reporting_table, table3_styles);
                        

                             // Write this out
                             var template_path = "./assets/templates/bulletin.v2.docx";
                                    
                             if (template == TEMPLATE_UNFORMATTED){
                                var template_path = "./assets/templates/demo_template.v2.docx";
                                //var template_path = "./assets/templates/test.v2.docx";
                             } 

                             d2.Api.getApi()
                            .get('/reportTables/mwIxx5SWy9b/data.json?date='+year_obj.year+'-'+month_obj.month_num+'-01')
                            .then(function(mapdata_results) {

                                console.log("Got map data: ", mapdata_results['title']);
                                this.setState({ percent_done: 70 });

                                axios.post('https://guinea-malaria-maps.herokuapp.com/confirmations.png', mapdata_results, { responseType: 'arraybuffer' })
                                .then(res => {
                                    
                                    this.setState({ percent_done: 75 });
                                    console.log("downloaded confirmations.png");
                                    var imagedata = "data:image/png;base64,"+Buffer.from(res.data, 'binary').toString('base64');
                                    bulletin_data["img_confirmations"] = imagedata;
                                    
                                    axios.post('https://guinea-malaria-maps.herokuapp.com/totalconfirmed.png', mapdata_results, { responseType: 'arraybuffer' })
                                    .then(res => {
                                        
                                        this.setState({ percent_done: 80 });
                                        console.log("downloaded totalconfirmed.png");
                                        var imagedata = "data:image/png;base64,"+Buffer.from(res.data, 'binary').toString('base64');
                                        bulletin_data["img_totalconfirmed"] = imagedata;

                                        axios.post('https://guinea-malaria-maps.herokuapp.com/incidence.png', mapdata_results, { responseType: 'arraybuffer' })
                                            .then(res => {
                                                
                                                this.setState({ percent_done: 85 });
                                                console.log("downloaded incidence.png");
                                                var imagedata = "data:image/png;base64,"+Buffer.from(res.data, 'binary').toString('base64');
                                                bulletin_data["img_incidence"] = imagedata;

                                                PizZipUtils.getBinaryContent(template_path,function(error,content){
                                
                                                    this.setState({ percent_done: 90 });
                                                    console.log("merging data into document");
            
                                                    var zip = new PizZip(content);
                                                    const doc = new Docxtemplater(zip, { modules: [imageModule,styleModule] });
                                                    
                                                    console.log("Here are the final results: " , bulletin_data);
                                                    doc.setData(bulletin_data);

                                                    try {
                                                        doc.render()
                                                    }
                                                    catch (error) {
                                                        var e = {
                                                            message: error.message,
                                                            name: error.name,
                                                            stack: error.stack,
                                                            properties: error.properties,
                                                        }
                                                        console.log(JSON.stringify({error: e}));
                                                        // The error thrown here contains additional information when logged with JSON.stringify (it contains a property object).
                                                        throw error;
                                                    }
                                                    
                                                    this.setState({ percent_done: 95 });
                                                    console.log("document rendered");

                                                    var out = doc.getZip().generate({
                                                        type: "blob",
                                                        mimeType:
                                                        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                                                    });
                                                    saveAs(out, "generated.docx");
            
                                                    console.log("Done!");
                                                    this.setState({ percent_done: 100 });  
                                                    
                    
                                                }.bind(this));
                                                

                                            }).catch(error => {
                                                console.error(error)
                                            });

                                    }).catch(error => {
                                        console.error(error)
                                    });

                                }).catch(error => {
                                    console.error(error)
                                });


                            }.bind(this));  //Get map data
                        }.bind(this)); // Table III
                    }.bind(this)); // Table II
            }.bind(this)); // Table I
        }.bind(this)  ); // Reporting table

     }
            


    render() {
        return (
                <div className={classes.container}>

            <ProgressBar
                    percent={this.state.percent_done}
                    filledBackground="linear-gradient(to right, #fefb72, #f0bb31)"

                />
                    
                <div className={classes.block}>
                    <h1>{i18n.t('Monthly Malaria Bulletin')}</h1>
                    <p>{i18n.t('This application is used to export the monthly malaria report as a Microsoft Word document. To start, select the month and the button.')}</p>
                </div>       
            
                <div className={classes.block}>
                    <span className={classes.labels}>{i18n.t('Month')}</span>
                    <SingleSelectField dataTest="dhis2-uiwidgets-singleselectfield" onChange={this.updatemonth.bind(this)} 
                    className={classes.picker} selected={this.state.month}>
                        <SingleSelectOption dataTest="dhis2-uicore-singleselectoption" label={i18n.t('January')} value="01"/>
                        <SingleSelectOption dataTest="dhis2-uicore-singleselectoption" label={i18n.t('February')} value="02"/>
                        <SingleSelectOption dataTest="dhis2-uicore-singleselectoption" label={i18n.t('March')} value="03"/>
                        <SingleSelectOption dataTest="dhis2-uicore-singleselectoption" label={i18n.t('April')} value="04"/>
                        <SingleSelectOption dataTest="dhis2-uicore-singleselectoption" label={i18n.t('May')} value="05"/>
                        <SingleSelectOption dataTest="dhis2-uicore-singleselectoption" label={i18n.t('June')} value="06"/>
                        <SingleSelectOption dataTest="dhis2-uicore-singleselectoption" label={i18n.t('July')} value="07"/>
                        <SingleSelectOption dataTest="dhis2-uicore-singleselectoption" label={i18n.t('August')} value="08"/>
                        <SingleSelectOption dataTest="dhis2-uicore-singleselectoption" label={i18n.t('September')} value="09"/>
                        <SingleSelectOption dataTest="dhis2-uicore-singleselectoption" label={i18n.t('October')} value="10"/>
                        <SingleSelectOption dataTest="dhis2-uicore-singleselectoption" label={i18n.t('November')} value="11"/>
                        <SingleSelectOption dataTest="dhis2-uicore-singleselectoption" label={i18n.t('December')} value="12"/>
                    </SingleSelectField>
                    
                        <span className={classes.labels}>{i18n.t('Year')}</span>
                        <SingleSelectField dataTest="dhis2-uiwidgets-singleselectfield" onChange={this.updateyear.bind(this)}
                        className={classes.picker} selected={this.state.year}>
                            <SingleSelectOption dataTest="dhis2-uicore-singleselectoption" label="2020" value="2020"/>
                            <SingleSelectOption dataTest="dhis2-uicore-singleselectoption" label="2019" value="2019"/>
                        </SingleSelectField>
                </div>

                <div className={classes.block}>
                    <Button className={classes.buttons} dataTest="dhis2-uicore-button" name="Primary button" onClick={this.generateBulletin.bind(this, TEMPLATE_FORMATTED)} primary type="button" value="default">
                        {i18n.t('Generate Bulletin')}
                    </Button>

    
                </div>

            
            </div>
        )

}
}

