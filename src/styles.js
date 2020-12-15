export function getStyle(dataelement, value){
        
	/* 
		complétude no9OnzE3Yy7 
	*/
    if (dataelement== "no9OnzE3Yy7" ){                                 
        // green
        if (value > 90 ){
            var style = {cellBackground: "#039736",textColor: "#ffffff",
            }
        } 
        // yellow
        else if(value < 90  && value > 50){   
            var style = {cellBackground: "#E4F63B",textColor: "#ffffff",
            }
        } 
        // red
        else {
            var style = {cellBackground: "#ED1102",textColor: "#ffffff",
            }
        }
	  
		
	/* 
		promptitude yM51VVWhtk3 
	*/

    } else if  (dataelement== "Ih6HJlhmY5d" ){                                 
        // green
        if (value > 90 ){
            var style = {cellBackground: "#039736",textColor: "#ffffff",
            }
        } 
        // yellow
        else if(value < 90  && value > 50){   
            var style = {cellBackground: "#E4F63B",textColor: "#ffffff",
            }
        } 
        // red
        else {
            var style = {cellBackground: "#ED1102",textColor: "#ffffff",
            }
        }
        
    }

    return style;

}