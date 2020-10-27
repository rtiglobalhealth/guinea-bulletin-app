import React from 'react'
import { DataQuery } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import classes from './App.module.css'
import './locales'
import { Button } from '@dhis2/ui-core'


import PizZip from 'pizzip';
import PizZipUtils from 'pizzip/utils'
import Docxtemplater from 'docxtemplater';
import { saveAs } from 'file-saver';

const StyleModule = require("./es6");
const styleModule = new StyleModule();

const query = {
    me: {
        resource: 'me',
    },
}

function isLangRTL(code) {
    const langs = ['ar', 'fa', 'ur']
    const prefixed = langs.map(c => `${c}-`)
    return langs.includes(code) || prefixed.filter(c => code.startsWith(c)).length > 0
}

function changeLocale(locale) {
    moment.locale(locale)
    i18n.changeLanguage(locale)
    document.documentElement.setAttribute('dir', isLangRTL(locale) ? 'rtl' : 'ltr')
}

function useDocx(){
  
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


const BulletinApp = () => (
    
    
    <div className={classes.container}>

        <h2>{i18n.t('Monthly Malaria Bulletin')}</h2>
        <p>{i18n.t('This application is used to export the monthly malaria report as a Microsoft Word document. To start, select the month and the button.')}</p>

        <Button dataTest="dhis2-uicore-button" name="Primary button" onClick={useDocx} primary type="button" value="default">
            {i18n.t('Generate Bulletin')}
        </Button>
       
    </div>
)

export default BulletinApp
