var sm = angular.module('adminPanel', ['ui.mask']);
sm.directive('ngFiles', ['$parse', function ($parse) {
	function fn_link(scope, element, attrs) {
		var onChange = $parse(attrs.ngFiles);
		element.on('change', function (event) {
			onChange(scope, {$files: event.target.files});
		});
	};
	return {
		link: fn_link
	}
} ]);
sm.config(['uiMask.ConfigProvider', function(uiMaskConfigProvider) {
	uiMaskConfigProvider.clearOnBlur(false);
}]);
//person edit-form controller
sm.controller('peersonEditCtrl', function($scope,$http,$element,displayServ) {
	$scope.dispServ = displayServ;
	//sync scope data with outer service
	$scope.$watch('displayServ.edtFormContents', function() {
		$scope.editPerson=displayServ.edtFormContents;
	});
	
	
	var init = function () {
		displayServ.showEditForm=false;
	};
	$scope.close=function(){
		displayServ.showEditForm=false;
	};
	$scope.save=function(){
		//TODO post
		//TODO post all data to server and if response positive -> edit line and hide form
		var xsrf=$scope.editPerson;
			xsrf.actionType="editPerson";
		$http({
			method: 'POST',
			url: $scope.serverPostHandler,
			headers: {'Content-Type': 'application/x-www-form-urlencoded'},
			transformRequest: function(obj) {
				var str = [];
				for(var p in obj)
				str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
				return str.join("&");
			},
			data: xsrf
		}).then(function (response) {
			console.log('ADD>>post>>sucess>>response',response);
			displayServ.showEditForm=false;
		});
		
		
	};
	init();
});
sm.service('displayServ', function(){
    this.showEditForm = false;
	this.edtFormContents={};
	this.savedFormContents={};
});
//person controller
sm.controller('personaCtrl', function($scope,$http,$element,displayServ) {
	$scope.dispServ = displayServ;
	$scope.editPerson={};
	//sync outer service with scope data
	$scope.$watch('editPerson', function() {
		displayServ.edtFormContents = $scope.editPerson;
	});
	//sync scope data with outer service saved by edit form
	$scope.$watch('displayServ.savedFormContents', function() {
		$scope.editPerson=displayServ.edtFormContents;
	});
	//action od edit button clicked
	$scope.edit=function(){
		var personObj=this.person;
		//show edit form container
		displayServ.showEditForm=true;
		//pass person object to sync service
		//$scope.editPerson=personObj;
		displayServ.edtFormContents=personObj;
	};
	$scope.del=function(){
		var person=this.person;
		var persId=person.personId;
		$scope.persons.splice( $scope.persons.indexOf(person), 1 );
		//send remove id to server
		$http({
			method: 'POST',
			url: $scope.serverPostHandler,
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded'
			},
			transformRequest: function(obj) {
				var str = [];
				for(var p in obj)
				str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
				return str.join("&");
			},
			data: {actionType: 'delPerson',personId: persId}
		}).then(function (response) {
			//personId:'',
		});
	};
});
//whole admin panel controller
sm.controller('adminPanelCtrl', function($scope,$http,$element,displayServ) {
	$scope.displayServ = displayServ;
	var init = function () {
		$http({
			method: 'POST',
			url: $scope.serverPostHandler,
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded'
			},
			transformRequest: function(obj) {
				var str = [];
				for(var p in obj)
				str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
				return str.join("&");
			},
			data: {actionType: 'getPersons'}
		}).then(
		function(response){//success
			var ps=response.data;
			for(var pers in ps){
				//TODO split by - and rearange with dots
				var dobArr=(ps[pers]['dob']).split('-');
				ps[pers]['dob']=dobArr[2]+'.'+dobArr[1]+'.'+dobArr[0];
				$scope.persons.push(ps[pers]);
			}
		}, function(response){//error
			
		});
	};
	$scope.showEditForm=false;
	$scope.headline="Панель администрирования";
	$scope.serverPostHandler="/adminPanel/panel.php";
	$scope.newPerson={
		personId:'',
		lastName:'',
		firstName:'',
		midName:'',
		dob:'',
		phone:'',
		email:'',
		login:'',
		pass:'',
		photo:'',
		uploadedPhotoUrl:''
	};

	$scope.persons=[];
	var formdata = new FormData();
	$scope.uploadFile=function($files){
		angular.forEach($files, function (value, key) {
			formdata.append(key, value);
		});
		//FILL FormData WITH FILE DETAILS.
		data=formdata;
		// ADD LISTENERS.
		var objXhr = new XMLHttpRequest();
		//objXhr.addEventListener("progress", updateProgress, false);
		objXhr.addEventListener("load", transferComplete, false);

		// SEND FILE DETAILS TO THE API.
		objXhr.open("POST", $scope.serverPostHandler);
		objXhr.send(data);
		/*
		// UPDATE PROGRESS BAR.
		function updateProgress(e) {
			if (e.lengthComputable) {
				document.getElementById('pro').setAttribute('value', e.loaded);
				document.getElementById('pro').setAttribute('max', e.total);
			}
		}
		*/
		function transferComplete(e) {
			$scope.newPerson.uploadedPhotoUrl='../adminPanel/'+(JSON.parse(objXhr.response)).fileUrl;
		}
	};
	$scope.add = function(isValid){
		//post all data to server and 
		//TODO if response negative -> remove line
		var xsrf=$scope.newPerson;
			xsrf.actionType='addPerson';
		$http({
			method: 'POST',
			url: $scope.serverPostHandler,
			headers: {'Content-Type': 'application/x-www-form-urlencoded'},
			transformRequest: function(obj) {
				var str = [];
				for(var p in obj)
				str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
				return str.join("&");
			},
			data: xsrf
		}).then(function (response) {
			console.log('ADD>>post>>sucess>>response',response);
			//TODO personId:'',
		});
		//check if array already contains person
		var personExists = false;
		for(var i = 0; i < $scope.persons.length; i++) {
			if ($scope.persons[i].lastName == $scope.newPerson.lastName && $scope.persons[i].firstName == $scope.newPerson.firstName && $scope.persons[i].midName == $scope.newPerson.midName) {
				personExists = $scope.persons[i];
				break;
			}
		}
		if(personExists){//edit person
			personExists.dob=$scope.newPerson.dob;
			personExists.phone=$scope.newPerson.phone;
			personExists.email=$scope.newPerson.email;
			personExists.login=$scope.newPerson.login;
			
		}else{//add person
			
			$scope.persons.push({
				lastName:$scope.newPerson.lastName,
				firstName:$scope.newPerson.firstName,
				midName:$scope.newPerson.midName,
				dob:$scope.newPerson.dob,
				phone:$scope.newPerson.phone,
				email:$scope.newPerson.email,
				login:$scope.newPerson.login,
				uploadedPhotoUrl:$scope.newPerson.uploadedPhotoUrl,
				additionalCssClass:'',
				status:0,
				edit:function(){
					var person=this;
				},
				uploadFile:function(){
				}
			});
			
		}
	};
	init();
});
