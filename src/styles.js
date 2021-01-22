export function getStyle(dataelement, value){
		
	const peach = "#f2ccb1";
	const green = "#a0cd63";
	const yellow = "#fffd54";
	const red = "#eb3223";
	const whiteTextColor = "#ffffff";
	const blackTextColor = "#000000";

	/*
		Use color coding for percentages
	*/
	if (dataelement== "no9OnzE3Yy7" || //complétude
		dataelement== "Ih6HJlhmY5d" ||
		dataelement== "PifhiFgcyq1" || 
		dataelement== "zAhqn2Vwacr" ){                                 
		
		// whatever that pinkish color is
		if (value > 100 &&  value <= 90){
            var style = {cellBackground: peach, textColor: whiteTextColor}
        }
		// green
		else if (value > 90 ){
            var style = {cellBackground: green, textColor: whiteTextColor
            }
        } 
        // yellow
        else if(value < 90  && value > 50){   
            var style = {cellBackground: yellow, textColor: blackTextColor
            }
        } 
        // red
        else {
            var style = {cellBackground: red, textColor: whiteTextColor
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
				var style = {cellBackground: green, textColor: whiteTextColor}
			} 
			// yellow
			else if(value < 3){ 
				var style = {cellBackground: red, textColor: blackTextColor}
			} 
			// peach
			else {
				var style = {cellBackground: peach, textColor: whiteTextColor}
			}	
}


    return style;

}