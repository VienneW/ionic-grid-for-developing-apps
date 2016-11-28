angular.module('SimpleRESTIonic.controllers', [])

    .controller('LoginCtrl', function (Backand, $state, $rootScope, LoginService) {
        var login = this;

        function signin() {
            LoginService.signin(login.email, login.password)
                .then(function () {
                    onLogin();
                }, function (error) {
                    console.log(error)
                })
        }

        function anonymousLogin(){
            LoginService.anonymousLogin();
            onLogin();
        }

        function onLogin(){
            $rootScope.$broadcast('authorized');
            login.email = '';
            login.password = '';
            $state.go('tab.dashboard');
        }

        function signout() {
            LoginService.signout()
                .then(function () {
                    //$state.go('tab.login');
                    login.email = '';
                    login.password = '';
                    $rootScope.$broadcast('logout');
                    $state.go($state.current, {}, {reload: true});
                })

        }

        login.signin = signin;
        login.signout = signout;
        login.anonymousLogin = anonymousLogin;
    })

    .controller('DashboardCtrl', function (ItemsModel, $rootScope, $scope) {
        var vm = this;

        function goToBackand() {
            window.location = 'http://docs.backand.com';
        }

        function getAll() {
            ItemsModel.all()
                .then(function (result) {
                    vm.data = result.data.data;
                    updateDataLength();
                });

        }

        function clearData() {
            vm.data = null;
        }

        function create(object) {
          object.sold = 0;
            ItemsModel.create(object)
                .then(function (result) {
                    cancelCreate();
                    getAll();
                    updateDataLength();
                });
        }

        function update(object) {
            ItemsModel.update(object.id, object)
                .then(function (result) {
                    cancelEditing();
                    getAll();
                });
        }

        function deleteObject(id) {
            ItemsModel.delete(id)
                .then(function (result) {
                    cancelEditing();
                    getAll();
                    updateDataLength();
                });
        }

        function initCreateForm() {
            vm.newObject = {name: '', description: '',date:'',merchandiser:'',cost:'',quantity:'',price:'',sold:'' };
        }

        function setEdited(object) {
            vm.edited = angular.copy(object);
            vm.isEditing = true;
        }

        function isCurrent(id) {
            return vm.edited !== null && vm.edited.id === id;
        }

        function cancelEditing() {
            vm.edited = null;
            vm.isEditing = false;
        }

        function cancelCreate() {
            initCreateForm();
            vm.isCreating = false;
        }

        function addItem(object){
              if(vm.objects.length == 0){
                for (var i = 0; i < 50; i++) {
                  vm.objects[i] = 0;
                }
                vm.objects.splice(object.id, 0, 1);
                vm.total = 0;
              } else {
                if((object.quantity - vm.objects[object.id])> 0){
                  vm.objects[object.id] = vm.objects[object.id] +1;
                  vm.total = vm.total + object.price;
                }
              }
              if(vm.objects[object.id] == 1){
                vm.objectss.push(object);
              }
        }

        function cancelItem(object, objectssId){
          //vm.showOrdered[id] = false;
          vm.objects[object.id] = vm.objects[object.id] - 1;
          vm.total = vm.total - object.price;
          if(vm.objects[object.id] < 1){
            vm.objectss.splice(objectssId,1);
          }
        //  vm.objectnames.splice(id,1);

        }

        function sellItem(){
          for (i = 0; i < vm.objectss.length; i++) {
              vm.objectss[i].quantity = vm.objectss[i].quantity - vm.objects[vm.objectss[i].id];
              vm.objectss[i].sold = vm.objectss[i].sold + vm.objects[vm.objectss[i].id];
              ItemsModel.update(vm.objectss[i].id, vm.objectss[i])
              .then(function (result) {
                  //cancelEditing();
                  getAll();
              });
          }

          for (var i = 0; i < vm.objects.length; i++) {
            vm.objects[i] = 0;
          }
          vm.objectss = [];
          vm.showOrdered = [];
          vm.objectnames= [];
          vm.total = 0;
        }

        function updateDataLength() {
          var dataLength = vm.data.length;
          var i = 0;
          while(i<dataLength){
            vm.numofItems.push(i);
            i = i+3;
          }
        }


        vm.updateDataLength = updateDataLength;
        vm.numofItems = [];
        vm.total = 0;
        vm.objectnames = [];
        vm.sellItem = sellItem;
        vm.cancelItem = cancelItem;
        vm.addItem = addItem;
        //vm.showOrdered = [];
        vm.objects = [];
        vm.objectss = [];
        vm.edited = null;
        vm.isEditing = false;
        vm.isCreating = false;
        vm.getAll = getAll;
        vm.create = create;
        vm.update = update;
        vm.delete = deleteObject;
        vm.setEdited = setEdited;
        vm.isCurrent = isCurrent;
        vm.cancelEditing = cancelEditing;
        vm.cancelCreate = cancelCreate;
        vm.goToBackand = goToBackand;
        vm.isAuthorized = false;

        $rootScope.$on('authorized', function () {
            vm.isAuthorized = true;
            getAll();
            updateDataLength();
        });

        $rootScope.$on('logout', function () {
            clearData();
        });

        if (!vm.isAuthorized) {
            $rootScope.$broadcast('logout');
        }

        initCreateForm();
        getAll();


    });
