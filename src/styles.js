export function getStyle(dataelement, value){
		
	const peach = "#f2ccb1";
	const green = "#a0cd63";
	const yellow = "#fffd54";
	const red = "#eb3223";
	const textColor = "#ffffff";

	/*
		Use color coding for percentages
	*/
	if (dataelement== "no9OnzE3Yy7" || //complétude
		dataelement== "Ih6HJlhmY5d" ||
		dataelement== "PifhiFgcyq1" || 
		dataelement== "zAhqn2Vwacr" ){                                 
		
		// whatever that pinkish color is
		if (value > 100 &&  value <= 90){
            var style = {cellBackground: peach, textColor: textColor}
        }
		// green
		else if (value > 90 ){
            var style = {cellBackground: green, textColor: textColor
            }
        } 
        // yellow
        else if(value < 90  && value > 50){   
            var style = {cellBackground: yellow, textColor: textColor
            }
        } 
        // red
        else {
            var style = {cellBackground: red, textColor: textColor
            }
        }
	}
	
	/*
		Use Stock out color coding
	*/
	else if  (
		dataelement== "nnk0OcCQJm5" ||
		dataelement=="qUdyYqApz8R" || 
		dataelement=="lno8U7t5TLI"){                                 
	
			// green
			if (value >= 3 && value <= 5 ){
				var style = {cellBackground: green, textColor: textColor}
			} 
			// yellow
			else if(value < 3){ 
				var style = {cellBackground: red, textColor: textColor}
			} 
			// peach
			else {
				var style = {cellBackground: peach, textColor: textColor}
			}	
}


    return style;

}