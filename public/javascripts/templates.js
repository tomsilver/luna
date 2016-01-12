angular.module('luna').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('public/template/footer.html',
    "Copyright &copy; 2015 Material Admin<ul class=\"f-menu\"><li><a href=\"\">Hadssome</a></li><li><a href=\"\">Dashboard</a></li><li><a href=\"\">Reports</a></li><li><a href=\"\">Support</a></li><li><a href=\"\">Contact</a></li></ul>"
  );


  $templateCache.put('public/template/game-menu.html',
    "<li class=\"btn-wave\" data-ui-sref-active=\"active\"><a data-ui-sref=\"home.game.interview\">Interview</a></li><li class=\"btn-wave\" data-ui-sref-active=\"active\"><a data-ui-sref=\"home.game.response\">Response</a></li><li class=\"btn-wave\" data-ui-sref-active=\"active\"><a data-ui-sref=\"home.game.guess\">Guess</a></li><li class=\"btn-wave\" data-ui-sref-active=\"active\"><a data-ui-sref=\"home.game.final\">Result</a></li>"
  );


  $templateCache.put('public/template/header.html',
    "<ul class=\"header-inner clearfix\"><li class=\"logo hidden-xs\"><a data-ui-sref=\"home.new\" data-ng-click=\"lunaCtrl.sidebarStat($event)\">Luna</a></li><li class=\"pull-right\"><ul class=\"top-menu\"><li class=\"dropdown\" ng-click=\"hideNotifications()\" uib-dropdown><a uib-dropdown-toggle href=\"\"><i class=\"tm-icon zmdi zmdi-notifications\"></i> <i class=\"tmn-counts\" ng-show=\"notifiedGamesCount && !silenceNotifs\">{{ notifiedGamesCount }}</i></a><div class=\"dropdown-menu dropdown-menu-lg stop-propagate pull-right\"><div class=\"listview\" id=\"notifications\"><div class=\"lv-header\">Your Turn</div><div class=\"lv-body\"><div class=\"lv-item\" ng-repeat=\"game in notifiedGames\" data-ui-sref=\"home.game({id : game._id})\" ui-sref-opts=\"{reload: true}\" style=\"cursor: pointer\"><div class=\"lv-title m-b-5\">{{ game.phase | phaseName }}</div><div class=\"progress\"><div ng-class=\"'progress-bar bgm-{{ game.color | colorName }}'\" role=\"progressbar\" aria-valuenow=\"{{ game.phase | phasePerc }}\" aria-valuemin=\"0\" aria-valuemax=\"100\" style=\"width: {{ game.phase | phasePerc }}%\"></div></div></div></div><div class=\"clearfix\"></div><a class=\"lv-footer\" ng-click=\"clearNotifications()\">Clear</a></div></div></li><li class=\"dropdown\" uib-dropdown><a uib-dropdown-toggle href=\"\"><i class=\"tm-icon zmdi zmdi-more-vert\"></i></a><ul class=\"dropdown-menu dm-icon pull-right\"><li><a data-ui-sref=\"home.new\"><i class=\"zmdi zmdi-home\"></i> Home</a></li><li><a data-ui-sref=\"profile\"><i class=\"zmdi zmdi-settings\"></i> Account</a></li><li><a ng-click=\"logOut()\"><i class=\"zmdi zmdi-sign-in\"></i> Sign Out</a></li></ul></li></ul></li></ul>"
  );

}]);
