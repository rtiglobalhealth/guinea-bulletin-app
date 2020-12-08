import React from 'react'
import { useDataQuery, useConfig } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import classes from './App.module.css'
import './locales'
import { Button, SingleSelectOption } from '@dhis2/ui-core'
import { SingleSelectField } from '@dhis2/ui-widgets'

import { init, getManifest } from 'd2';


import PizZip from 'pizzip';
import PizZipUtils from 'pizzip/utils'
import Docxtemplater from 'docxtemplater';
import { saveAs } from 'file-saver';

const TEMPLATE_FORMATTED = "formatted";
const TEMPLATE_UNFORMATTED = "unformatted";

const StyleModule = require("./es6");
const styleModule = new StyleModule();

const query = {
    me: {
        resource: 'me',
    },
}



export default class BulletinApp extends React.Component {

    constructor(props, context) {
        super(props);
        this.state = {
            month: "01",
            year: "2019"
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
            
                var reporting_table = {};

                //shove all this into a object for reading later.
                for (var i = 0; i < reporting_rate_results.rows.length; i++) {
                    var dataelement = reporting_rate_results.rows[i];
                    reporting_table[ dataelement[1]+"."+dataelement[0] ] = dataelement[3]; 
                }

                // Get data for table II (Taux d'incidence )
                d2.Api.getApi()
                .get('/analytics?dimension=dx:mH24Ynkgo4K,ou:Ky2CzFdfBuO;LEVEL-5&filter=pe:201901&order=DESC&showHierarchy=true')
                .then(function(table2_results) {

                    console.log("retrieving " +table2_results.rows.length + " rows for Table II");
                    //console.log(table2_results);
                    var table1_data = {};
                    var table2_data = {};
                    var table3_data = {};

                    var bulletin_data = Object.assign({}, period,table1_data,table2_data,table3_data, reporting_table);
                    console.log("Here are the final results: " , bulletin_data);

            
            });
        });

     }
            






    render() {
        return (
                <div className={classes.container}>

                    
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

                    <Button className={classes.buttons} dataTest="dhis2-uicore-button" name="Primary button" onClick={this.useDocx.bind(this)} type="button" value="default">
                        {i18n.t('Generate Template')}
                    </Button>
                </div>

            
            </div>
        )

}
}

