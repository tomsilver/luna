angular.module('phaseFilters', []).filter('phaseName', function() {
  return function(phase) {
    if (phase < 2) {
        return 'Interview Phase';
    }
    if (phase < 4) {
        return 'Response Phase';
    }
    if (phase < 6) {
    	return 'Guess Phase';
    }
    return 'Game Complete';
  };
});

angular.module('colorFilters', []).filter('colorName', function() {
  return function(colorNum) {
  	var color;
    switch(colorNum) {
    	case 0:
    		color = 'black';
    		break;
    	case 1:
    		color = 'brown';
    		break;
    	case 2:
    		color = 'red';
    		break;
    	case 3:
    		color = 'blue';
    		break;
    	case 4:
    		color = 'purple';
    		break;
    	case 5:
    		color = 'deeppurple';
    		break;
    	case 6:
    		color = 'lightblue';
    		break;
    	case 7:
    		color = 'cyan';
    		break;
    	case 8:
    		color = 'teal';
    		break;
    	case 9:
    		color = 'green';
    		break;
    	case 10:
    		color = 'lightgreen';
    		break;
    	case 11:
    		color = 'lime';
    		break;
    	case 12:
    		color = 'yellow';
    		break;
    	case 13:
    		color = 'amber';
    		break;
    	case 14:
    		color = 'deeporange';
    		break;
    	case 15:
    		color = 'gray';
    		break;
    	default:
    		color = 'indigo';
    		break;
    }
    return color;
};
});