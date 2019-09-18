'use strict';

var app = angular.module('Gastapp', [
  'ngRoute',
  'mobile-angular-ui',
  'mobile-angular-ui.gestures',
  'angularUUID2'
]);

app.run(function ($transform) {
    window.$transform = $transform;
});

app.config(function ($routeProvider) {
    $routeProvider.when('/', {
        templateUrl: 'views/home.html',
        reloadOnSearch: false
    });
    $routeProvider.when('/detalles', {
        templateUrl: 'views/detalles.html',
        reloadOnSearch: false
    });
    $routeProvider.when('/graficos', {
        templateUrl: 'views/graficos.html',
        reloadOnSearch: false
    });
    $routeProvider.otherwise({
        redirectTo: '/'
    });
});

app.service("serviceDatos", function () {
    var monto;
    var descripcion;
    var categoria;
    var tipo;
    var fecha;
});

app.controller("controllerClick", function ($scope, serviceDatos) {
    $scope.Click = function (x) {
        serviceDatos.categoria = x;
    }
    $scope.clickMov = function (y) {
        serviceDatos.tipo = y;
    }
});

app.controller("controllerGrafico", function () {
    google.charts.load('current', {
        'packages': ['corechart']
    });
    google.charts.setOnLoadCallback(drawChart);

    var datosTabla = [["Fecha", "Ingresos", "Egresos"]];
    var datosTablaComb = [["Fecha", "Movimientos"]];
    var infoTabla = [];

    if (localStorage.movimientoLocal !== undefined && localStorage.movimientoLocal !== "[]" && localStorage.movimientoLocal !== localStorage.movimientoServer) {
        infoTabla = JSON.parse(localStorage.movimientoLocal);
    } else {
        infoTabla = JSON.parse(localStorage.movimientoServer);
    }

    var movimientoPos = 0;
    var movimientoNeg = 0;
    var balanceCombinados = 0;

    infoTabla.forEach(function (movimiento, index) {
        var movimientoCompleto = [];

        if (datosTabla.length == 1) {
            movimientoCompleto = new Array(movimiento.fecha, 0, 0);
            datosTabla.push(movimientoCompleto);
        }

        if (movimiento.tipo == "ingreso") {
            movimientoPos += parseInt(movimiento.monto);
            movimientoCompleto = [movimiento.fecha, movimientoPos, datosTabla[index + 1][2]];
        }

        if (movimiento.tipo == "egreso") {
            movimientoNeg += parseInt(movimiento.monto);
            movimientoCompleto = [movimiento.fecha, datosTabla[index + 1][1], movimientoNeg];
        }

        datosTabla.push(movimientoCompleto);
    });

    infoTabla.forEach(function (movimiento, index) {
        var movimientoCompletoCombinados = [];

        if (datosTablaComb.length == 1) {
            movimientoCompletoCombinados = new Array(movimiento.fecha, 0);
            datosTablaComb.push(movimientoCompletoCombinados);
        }

        if (movimiento.tipo == "ingreso") {
            balanceCombinados += parseInt(movimiento.monto);
            movimientoCompletoCombinados = [movimiento.fecha, balanceCombinados];
        }

        if (movimiento.tipo == "egreso") {
            balanceCombinados -= parseInt(movimiento.monto);
            movimientoCompletoCombinados = [movimiento.fecha, balanceCombinados];
        }

        datosTablaComb.push(movimientoCompletoCombinados);
    })

    function drawChart() {
        var dataIndividuales = google.visualization.arrayToDataTable(datosTabla);
        var dataCombinados = google.visualization.arrayToDataTable(datosTablaComb);
        var options = {
            legend: {
                position: 'top'
            },
            colors: ['#4CAF50', '#F44336'],
            chartArea: {
                left: '17%',
                top: '8%',
                right: '10%',
                width: "90vw",
                height: "calc(100vh - 53px - 3.5em)"
            },
            hAxis: {
                slantedText: true,
                slantedTextAngle: 90
            }
        };
        var optionsComb = {
            legend: {
                position: 'top'
            },
            colors: ['#4c45d2'],
            chartArea: {
                left: '17%',
                top: '8%',
                right: '10%',
                width: "90vw",
                height: "calc(100vh - 53px - 3.5em)"
            },
            hAxis: {
                slantedText: true,
                slantedTextAngle: 90
            }
        }

        var chart = new google.visualization.LineChart(document.getElementById('curve_chart'));

        chart.draw(dataIndividuales, options);
        document.getElementById('individuales').setAttribute('style', 'background-color: #4CAF50; color: white')

        document.getElementById('individuales').addEventListener('click', function () {
            chart.draw(dataIndividuales, options);
            document.getElementById('combinados').setAttribute('style', 'background-color: white')
            document.getElementById('individuales').setAttribute('style', 'background-color: #4CAF50; color: white')
        }, false);

        document.getElementById('combinados').addEventListener('click', function () {
            chart.draw(dataCombinados, optionsComb);
            document.getElementById('individuales').setAttribute('style', 'background-color: white')
            document.getElementById('combinados').setAttribute('style', 'background-color: #4c45d2; color: white')
        }, false);
    }
});

app.controller("controllerGuardar", function ($scope, $rootScope, $http, $location, serviceDatos, uuid2) {
    $scope.getId = function () {
        $scope.id = uuid2.newuuid();
        return $scope.id;
    }

    if (localStorage.movimientoLocal == localStorage.movimientoServer) {
        localStorage.movimientoLocal = "[]";
    }

    if (localStorage.movEliminados) {
        $scope.idMovEliminados = JSON.parse(localStorage.movEliminados)
        $http({
            method: "POST",
            url: "http://finaladm.fedesack.com.ar/php/items.quitar.php",
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            data: $scope.idMovEliminados
        }).then(
            function exito(response) {
                localStorage.removeItem("movEliminados");
            },
            function fracaso(response) {
                console.log("# No se pudo conectar con el servidor #");
            })
    }

    if (localStorage.movimientoLocal !== undefined && localStorage.movimientoLocal !== "[]") {
        $rootScope.movLocalServer = JSON.parse(localStorage.movimientoLocal)
        $http({
            method: 'POST',
            url: "http://finaladm.fedesack.com.ar/php/guardar.php",
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            data: $rootScope.movLocalServer
        }).then(
            function exito(response) {
                localStorage.setItem("movimientoServer", JSON.stringify(response.data));
                localStorage.movimientoLocal = "[]";
            },
            function fracaso(response) {
                console.log("# No se pudo conectar con el servidor #");
            });

    } else {
        $rootScope.movLocalServer = [];
        localStorage.movimientoLocal = "[]";
    }

    $scope.controllerGuardar = function (dato) {
        if (dato.categoria !== undefined) {
            serviceDatos.categoria = dato.categoria;
        }

        if (dato.tipo !== undefined) {
            serviceDatos.tipo = dato.tipo;
        }

        serviceDatos.monto = dato.monto;
        serviceDatos.descripcion = dato.descripcion;
        serviceDatos.fecha = new Date();

        $scope.movimiento = {
            monto: serviceDatos.monto,
            descripcion: serviceDatos.descripcion,
            categoria: serviceDatos.categoria,
            tipo: serviceDatos.tipo,
            fecha: serviceDatos.fecha,
            edicion: false,
            falsoid: $scope.getId()
        }

        if (!localStorage.movimientoLocal) {
            $rootScope.movLocalServer = JSON.parse(localStorage.getItem("movimientoServer"));
        } else {
            if (localStorage.movimientoLocal == "[]") {
                localStorage.movimientoLocal = localStorage.movimientoServer;
            }
            $rootScope.movLocalServer = JSON.parse(localStorage.getItem("movimientoLocal"));
        }

        $rootScope.movLocalServer.push($scope.movimiento);

        $http({
            method: 'POST',
            url: "http://finaladm.fedesack.com.ar/php/guardar.php",
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            data: $scope.movLocalServer
        }).then(
            function exito(response) {
                localStorage.setItem("movimientoServer", JSON.stringify(response.data))
                $location.path("/home");
                $rootScope.movLocalServer = [];
                localStorage.movimientoLocal = "[]";
            },
            function fracaso(response) {
                console.log("# No se pudo conectar con el servidor #");
                localStorage.setItem("movimientoLocal", JSON.stringify($rootScope.movLocalServer))
                $location.path("#/");
            });
    }
});

app.controller("controllerMostrar", function ($scope, $rootScope, $http) {
    $http({
        method: 'POST',
        url: "http://finaladm.fedesack.com.ar/php/info.php",
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    }).then(
        function exito(response) {
            localStorage.setItem("movimientoServer", JSON.stringify(response.data))
            balanceCompleto();
        },
        function fracaso(response) {
            console.log("# No se pudo conectar con el servidor #");
            balanceCompleto();
        });

    function balanceCompleto() {

        if (localStorage.movimientoServer) {
            if (localStorage.movimientoLocal !== undefined && localStorage.movimientoLocal !== "[]") {
                $rootScope.traeme = localStorage.movimientoLocal;
            } else {
                $rootScope.traeme = localStorage.movimientoServer;
            }
            $rootScope.traeme = JSON.parse($rootScope.traeme);

            $scope.balanceController = 0;
            ($rootScope.traeme).forEach(function (dato) {
                dato.monto = JSON.parse(dato.monto);
                if (dato.tipo == "ingreso" && dato.monto !== undefined) {
                    $scope.balanceController += dato.monto;
                }
                if (dato.tipo == "egreso" && dato.monto !== undefined) {
                    $scope.balanceController -= dato.monto;
                }
                if (document.getElementById("Balance") !== null) {
                    if ($scope.balanceController <= "0") {
                        document.getElementById("Balance").classList.add('valorNeg');
                        if (document.getElementById("Balance").classList.contains('valorPos')) {
                            document.getElementById("Balance").classList.remove('valorPos');
                        }
                    } else {
                        document.getElementById("Balance").classList.add('valorPos');
                        if (document.getElementById("Balance").classList.contains('valorNeg')) {
                            document.getElementById("Balance").classList.remove('valorNeg');
                        }
                    }
                }
            });
        }
    }

    $scope.borrar = function (x) {
        var confirmar = confirm("¿Quiere borrar este movimiento?");
        if (confirmar == true) {
            $rootScope.traeme.splice($rootScope.traeme.indexOf(x), 1);
            $scope.datos_restantes = [];
            angular.forEach($rootScope.traeme, function (x) {
                $scope.datos_restantes.push(x);
                localStorage.setItem("movimientoLocal", JSON.stringify($scope.datos_restantes))
            });

            if (!localStorage.movEliminados) {
                $scope.cjEliminados = [];
            } else {
                $scope.cjEliminados = JSON.parse(localStorage.movEliminados)
            }

            if (x.id != undefined) {
                $scope.cjEliminados.push(x.id);
            }

            $http({
                method: "POST",
                url: "http://finaladm.fedesack.com.ar/php/items.quitar.php",
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                data: $scope.cjEliminados
            }).then(
                function exito(response) {
                    localStorage.setItem("movimientoServer", JSON.stringify(response.data))
                    localStorage.removeItem("movEliminados");
                    localStorage.movimientoLocal = "[]";
                },
                function fracaso(response) {
                    console.log("# No se pudo conectar con el servidor #");
                    localStorage.setItem("movEliminados", JSON.stringify($scope.cjEliminados))
                })
        }
    }
});


app.controller("controllerEditar", function ($scope, $routeParams, $location, $rootScope, $filter, $http) {
    $scope.parametros = $routeParams;

    $scope.editar = function (x) {
        $rootScope.x = x;
        if ($rootScope.x.tipo == 'ingreso') {
            $rootScope.x.tipoOtro = 'egreso';
            $rootScope.x.tipoName = 'Ingreso';
            $rootScope.x.tipoOtroName = 'Egreso';
        } else {
            $rootScope.x.tipoOtro = 'ingreso';
            $rootScope.x.tipoName = 'Egreso';
            $rootScope.x.tipoOtroName = 'Ingreso';
        }
    }

    $scope.actualizar = function (parametros) {
        if (!localStorage.movimientoLocal) {
            $rootScope.movLocalServer = JSON.parse(localStorage.getItem("movimientoServer"));
        } else {
            if (localStorage.movimientoLocal == "[]") {
                localStorage.movimientoLocal = localStorage.movimientoServer;
            }
            $rootScope.movLocalServer = JSON.parse(localStorage.getItem("movimientoLocal"));
        }

        $scope.actualizados = {
            id: $rootScope.x.id,
            monto: JSON.stringify(parametros.monto),
            descripcion: parametros.descripcion,
            categoria: parametros.categoria,
            tipo: parametros.tipo,
            edicion: new Date(),
            fecha: $rootScope.x.fecha,
            falsoid: $rootScope.x.falsoid,
        }

        for (var i = 0; i < $rootScope.movLocalServer.length; i++) {
            if ($scope.actualizados.fecha == $rootScope.movLocalServer[i].fecha) {
                $rootScope.movLocalServer.splice(i, 1);
            }
        }

        $rootScope.movLocalServer.push($scope.actualizados);
        localStorage.setItem("movimientoLocal", JSON.stringify($rootScope.movLocalServer));
        $rootScope.movLocalServer = JSON.parse(localStorage.movimientoLocal);

        if ($rootScope.movLocalServer) {
            $http({
                method: "POST",
                url: "http://finaladm.fedesack.com.ar/php/guardar.php",
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                data: $rootScope.movLocalServer
            }).then(
                function exito(response) {
                    $scope.respuesta = response.data;
                    localStorage.setItem("movimientoServer", JSON.stringify(response.data))
                    $rootScope.movLocalServer = [];
                    localStorage.movimientoLocal = "[]";
                    $location.path("#/");
                },
                function fracaso(response) {
                    console.log("# No se pudo conectar con el servidor #");
                    localStorage.setItem("movimientoLocal", JSON.stringify($rootScope.movLocalServer))
                    $location.path("#/");
                });
        }
    }
})
