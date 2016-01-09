angular.module('luna').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('public/template/footer.html',
    "Copyright &copy; 2015 Material Admin<ul class=\"f-menu\"><li><a href=\"\">Hadssome</a></li><li><a href=\"\">Dashboard</a></li><li><a href=\"\">Reports</a></li><li><a href=\"\">Support</a></li><li><a href=\"\">Contact</a></li></ul>"
  );


  $templateCache.put('public/template/game-menu.html',
    "<li class=\"btn-wave\" data-ui-sref-active=\"active\"><a data-ui-sref=\"home.game.interview\">Interview</a></li><li class=\"btn-wave\" data-ui-sref-active=\"active\"><a data-ui-sref=\"home.game.response\">Response</a></li><li class=\"btn-wave\" data-ui-sref-active=\"active\"><a data-ui-sref=\"home.game.guess\">Guess</a></li><li class=\"btn-wave\" data-ui-sref-active=\"active\"><a data-ui-sref=\"home.game.final\">Result</a></li>"
  );


  $templateCache.put('public/template/header.html',
    "<ul class=\"header-inner clearfix\"><li id=\"menu-trigger\"></li><li class=\"logo hidden-xs\"><a data-ui-sref=\"home\" data-ng-click=\"lunaCtrl.sidebarStat($event)\">Luna</a></li><li class=\"pull-right\"><ul class=\"top-menu\"><li class=\"dropdown\" uib-dropdown><a uib-dropdown-toggle href=\"\"><i class=\"tm-icon zmdi zmdi-notifications\"></i> <i class=\"tmn-counts\">9</i></a><div class=\"dropdown-menu dropdown-menu-lg stop-propagate pull-right\"><div class=\"listview\" id=\"notifications\"><div class=\"lv-header\">Your Turn</div><div class=\"lv-body\"><div class=\"lv-item\"><div class=\"lv-title m-b-5\">Response Phase</div><div class=\"progress\"><div class=\"progress-bar\" role=\"progressbar\" aria-valuenow=\"60\" aria-valuemin=\"0\" aria-valuemax=\"100\" style=\"width: 60%\"></div></div></div><div class=\"lv-item\"><div class=\"lv-title m-b-5\">Guess Phase</div><div class=\"progress\"><div class=\"progress-bar progress-bar-success\" role=\"progressbar\" aria-valuenow=\"80\" aria-valuemin=\"0\" aria-valuemax=\"100\" style=\"width: 80%\"></div></div></div><div class=\"lv-item\"><div class=\"lv-title m-b-5\">Guess Phase</div><div class=\"progress\"><div class=\"progress-bar progress-bar-info\" role=\"progressbar\" aria-valuenow=\"80\" aria-valuemin=\"0\" aria-valuemax=\"100\" style=\"width: 80%\"></div></div></div><div class=\"lv-item\"><div class=\"lv-title m-b-5\">Interview Phase</div><div class=\"progress\"><div class=\"progress-bar progress-bar-warning\" role=\"progressbar\" aria-valuenow=\"20\" aria-valuemin=\"0\" aria-valuemax=\"100\" style=\"width: 20%\"></div></div></div><div class=\"lv-item\"><div class=\"lv-title m-b-5\">View Results</div><div class=\"progress\"><div class=\"progress-bar progress-bar-danger\" role=\"progressbar\" aria-valuenow=\"100\" aria-valuemin=\"0\" aria-valuemax=\"100\" style=\"width: 100%\"></div></div></div></div><div class=\"clearfix\"></div><a class=\"lv-footer\" href=\"\">View All</a></div></div></li><li class=\"dropdown\" uib-dropdown><a uib-dropdown-toggle href=\"\"><i class=\"tm-icon zmdi zmdi-more-vert\"></i></a><ul class=\"dropdown-menu dm-icon pull-right\"><li class=\"skin-switch hidden-xs\"><span ng-repeat=\"w in lunaCtrl.skinList | limitTo : 6\" class=\"ss-skin bgm-{{ w }}\" data-ng-click=\"lunaCtrl.skinSwitch(w)\"></span></li><li class=\"divider hidden-xs\"></li><li><a href=\"\"><i class=\"zmdi zmdi-settings\"></i> Account</a></li><li><a href=\"\" ng-click=\"logOut()\"><i class=\"zmdi zmdi-sign-in\"></i> Sign Out</a></li></ul></li></ul></li></ul>"
  );

}]);
