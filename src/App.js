import React from 'react'
import { DataQuery } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import classes from './App.module.css'
import './locales'
import { Button, SingleSelectOption } from '@dhis2/ui-core'
import { SingleSelectField } from '@dhis2/ui-widgets'

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
            d2: props.d2,
            month: "1",
            year: "2019"
        }; 

        this.updatemonth = this.updatemonth.bind(this);
        this.updateyear = this.updateyear.bind(this);
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

    render() {

        return (
                <div className={classes.container}>

                <div className={classes.block}>
                    <h1>{i18n.t('Monthly Malaria Bulletin')}</h1>
                    <p>{i18n.t('This application is used to export the monthly malaria report as a Microsoft Word document. To start, select the month and the button.')}</p>
                </div>       
            
                <div className={classes.block}>
                    <span className={classes.labels}>{i18n.t('Month')}</span>
                    <SingleSelectField dataTest="dhis2-uiwidgets-singleselectfield" onChange={this.updatemonth} 
                    className={classes.picker} selected={this.state.month}>
                        <SingleSelectOption dataTest="dhis2-uicore-singleselectoption" label={i18n.t('January')} value="1"/>
                        <SingleSelectOption dataTest="dhis2-uicore-singleselectoption" label={i18n.t('February')} value="2"/>
                        <SingleSelectOption dataTest="dhis2-uicore-singleselectoption" label={i18n.t('March')} value="3"/>
                        <SingleSelectOption dataTest="dhis2-uicore-singleselectoption" label={i18n.t('April')} value="4"/>
                        <SingleSelectOption dataTest="dhis2-uicore-singleselectoption" label={i18n.t('May')} value="5"/>
                        <SingleSelectOption dataTest="dhis2-uicore-singleselectoption" label={i18n.t('June')} value="6"/>
                        <SingleSelectOption dataTest="dhis2-uicore-singleselectoption" label={i18n.t('July')} value="7"/>
                        <SingleSelectOption dataTest="dhis2-uicore-singleselectoption" label={i18n.t('August')} value="8"/>
                        <SingleSelectOption dataTest="dhis2-uicore-singleselectoption" label={i18n.t('September')} value="9"/>
                        <SingleSelectOption dataTest="dhis2-uicore-singleselectoption" label={i18n.t('October')} value="10"/>
                        <SingleSelectOption dataTest="dhis2-uicore-singleselectoption" label={i18n.t('November')} value="11"/>
                        <SingleSelectOption dataTest="dhis2-uicore-singleselectoption" label={i18n.t('December')} value="12"/>
                    </SingleSelectField>
                    
                        <span className={classes.labels}>{i18n.t('Year')}</span>
                        <SingleSelectField dataTest="dhis2-uiwidgets-singleselectfield" onChange={this.updateyear}
                        className={classes.picker} selected={this.state.year}>
                            <SingleSelectOption dataTest="dhis2-uicore-singleselectoption" label="2020" value="2020"/>
                            <SingleSelectOption dataTest="dhis2-uicore-singleselectoption" label="2019" value="2019"/>
                        </SingleSelectField>
                </div>

                <div className={classes.block}>
                    <Button className={classes.buttons} dataTest="dhis2-uicore-button" name="Primary button" onClick={this.useDocx} primary type="button" value="default">
                        {i18n.t('Generate Bulletin')}
                    </Button>

                    <Button className={classes.buttons} dataTest="dhis2-uicore-button" name="Primary button" onClick={this.useDocx} type="button" value="default">
                        {i18n.t('Generate Bulletin (non formatted)')}
                    </Button>
                </div>

            
            </div>
        )

}
}

