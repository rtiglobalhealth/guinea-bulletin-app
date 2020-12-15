import React from 'react'
import { useDataQuery, useConfig } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import classes from './App.module.css'
import './locales'
import { Button, SingleSelectOption } from '@dhis2/ui-core'
import { SingleSelectField } from '@dhis2/ui-widgets'

import { init, getManifest } from 'd2';

//import { getStyle } from './styles.js';
import { getStyle } from "./styles";

import PizZip from 'pizzip';
import PizZipUtils from 'pizzip/utils'
import Docxtemplater from 'docxtemplater';
import { saveAs } from 'file-saver';

import "react-step-progress-bar/styles.css";
import { ProgressBar } from "react-step-progress-bar";

const TEMPLATE_FORMATTED = "formatted";
const TEMPLATE_UNFORMATTED = "unformatted";

const StyleModule = require("./es6");
const styleModule = new StyleModule();

const query = {
    me: {
        resource: 'me',
    },
}

function initializeDistrictData(indicatorUIDArray){

    var table = {};

    for (const indicatorUID of indicatorUIDArray) {

        //these are the distircts
        table["q1zvw5TOnZF."+indicatorUID] = "";
        table["q1zvw5TOnZF."+indicatorUID] = "";
        table["L1Gr2bAsR4T."+indicatorUID] = "";
        table["THgRhO9eF0I."+indicatorUID] = "";
        table["KnR8IiGoSxQ."+indicatorUID] = "";
        table["GUSZlo8f9t8."+indicatorUID] = "";
        table["mqBP8r7CwKc."+indicatorUID] = "";
        table["IPv04VSahDi."+indicatorUID] = "";
        table["gHO8qPxfLdl."+indicatorUID] = "";
        table["VyZGMioVY5z."+indicatorUID] = "";
        table["qmVkCsfziWM."+indicatorUID] = "";
        table["CXHCAlP68L5."+indicatorUID] = "";
        table["jiGkwTWpBeq."+indicatorUID] = "";
        table["Motdz3Bql7L."+indicatorUID] = "";
        table["khK0Ewyw0vV."+indicatorUID] = "";
        table["cbst9kz3DHp."+indicatorUID] = "";
        table["Z71gNmPnc22."+indicatorUID] = "";
        table["zmSjEUspuVL."+indicatorUID] = "";
        table["VUj3PJpzty8."+indicatorUID] = "";
        table["HC3N6HbSdfg."+indicatorUID] = "";
        table["pChTVBEAPJJ."+indicatorUID] = "";
        table["kVULorkd7Vt."+indicatorUID] = "";
        table["dkWnjo1bSrU."+indicatorUID] = "";
        table["E1AAcXV9PxL."+indicatorUID] = "";
        table["QL7gnB6sSLA."+indicatorUID] = "";
        table["GuePjEvd6OH."+indicatorUID] = "";
        table["TEjr8hbfz9a."+indicatorUID] = "";
        table["zJZspSfD06r."+indicatorUID] = "";
        table["LyGsnnzEabg."+indicatorUID] = "";
        table["ISZZ5m7PYAC."+indicatorUID] = "";
        table["CoKlGkkiN4a."+indicatorUID] = "";
        table["jIFb011EBWB."+indicatorUID] = "";
        table["yvJVq1GjI2A."+indicatorUID] = "";
        table["ASu054HjT5Y."+indicatorUID] = "";
        table["D5WJbugzg9L."+indicatorUID] = "";
        table["QZJuFnb2WZ6."+indicatorUID] = "";
        table["XraGmJ5tF7e."+indicatorUID] = "";
        table["C4dKrWoT5au."+indicatorUID] = "";
        table["PCa6e3khx5E."+indicatorUID] = "2";
        table["PCa6e3khx5E."+indicatorUID] = "3";
        table["PCa6e3khx5E."+indicatorUID] = "4";

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


        //this.updatemonth = this.updatemonth.bind(this);
       // this.updateyear = this.updateyear.bind(this);
        
    }
    
    updateyear(event){
        this.setState({year: event.selected});
        console.log("updated the year");
    }

    updatemonth(event){
        
        this.setState({month: event.selected});
        console.log("updated the month");
    }
    
    useDocx(){
      
        var template_path = "./assets/demo_template.docx";
      
        PizZipUtils.getBinaryContent(template_path,function(error,content){
        
          var zip = new PizZip(content);
          var doc=new Docxtemplater().loadZip(zip);
          doc.attachModule(styleModule);
        
          doc.setData({
            label: "Hello",
            style: {
              cellBackground: "#00ff00",
              textColor: "#ffffff",
            },
            style2: {
              cellBackground: "#ff0000",
              textColor: "#0000ff",
            },
          });
      
          doc.render();
      
          var out=doc.getZip().generate({
            type:"blob",
            mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          });
      
          saveAs(out,"output.docx")
        
          console.log("did it!");
          
        });
      }


    


     /* templates can be TEMPLATE_FORMATTED or TEMPLATE_UNFORMATTED*/
     generateBulletin(template) {

         var d2 = this.state.d2;
         this.setState({ percent_done: 0 });
         
         var period = this.state.year+this.state.month;
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
                    //Palu cas graves traités 
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
                    //% de confirmation
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
                        //console.log(table2_results);
                        
                        this.setState({ percent_done: 60 });

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

                            this.setState({ percent_done: 80 });

                             //shove all this into a object for reading later.
                            for (var i = 0; i < table3_results.rows.length; i++) {
                                var dataelement = table3_results.rows[i];
                                table3_data[ dataelement[1]+"."+dataelement[0] ] = dataelement[3];
                            
                                var style = getStyle(dataelement[0],dataelement[3]);
                                table3_styles["s_"+dataelement[1]+"."+dataelement[0]] = style;

                            
                            }  
                            
                            var bulletin_data = Object.assign({}, period,table1_data,table2_data,table3_data, reporting_table, table3_styles);
                            console.log("Here are the final results: " , bulletin_data);


                             // Write this out
                             var template_path = "./assets/templates/bulletin.v2.docx";
                                    
                             if (template == TEMPLATE_UNFORMATTED){
                                 var template_path = "./assets/templates/test.v2.docx";
                             } 

                             PizZipUtils.getBinaryContent(template_path,function(error,content){
         
                                 var zip = new PizZip(content);
                                 var doc=new Docxtemplater().loadZip(zip);
                                 this.setState({ percent_done: 100 });
                                 
                                 doc.attachModule(styleModule);
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
                                 
                                 var out=doc.getZip().generate({
                                     type:"blob",
                                     mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                                 }) //Output the document using Data-URI
                                 saveAs(out,"bulletin_"+period+"_"+template+".docx")

                             }.bind(this));

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

                    <Button className={classes.buttons} dataTest="dhis2-uicore-button" name="Primary button" onClick={this.generateBulletin.bind(this, TEMPLATE_UNFORMATTED)} type="button" value="default">
                        {i18n.t('Generate Bulletin (non formatted)')}
                    </Button>

    
                </div>

            
            </div>
        )

}
}

