var sm = angular.module('StockManager', []);
sm.controller('StockManagerCtrl', function($scope) {
	$scope.headline = "Калькулятор портфеля ценных бумаг";
	$scope.stock = {};
	$scope.stock.name = '';
	$scope.stock.buyPrice = '';
	$scope.stock.quantity = '';
	$scope.stockPositions = [];
	$scope.stockPositionsWelth = "";
	$scope.showSummary = false;
	$scope.showStocks = true;
	$scope.onlyNumbers = /^\d+$/;
	$scope.filters = {
		all: function() {
			$scope.showSummary = false;
			$scope.showStocks = true;
			$scope.stockPositionsWelth = '';
		},
		lossy: function() {
			$scope.showSummary = false;
			$scope.showStocks = true;
			$scope.stockPositionsWelth = 'lossy';
		},
		incomy: function() {
			$scope.showSummary = false;
			$scope.showStocks = true;
			$scope.stockPositionsWelth = 'incomy';
		},
		neutral: function() {
			$scope.showSummary = false;
			$scope.showStocks = true;
			$scope.stockPositionsWelth = 'neutral';
		},
		summary: function() {
			$scope.showSummary = true;
			$scope.showStocks = false;
		}
	};
	$scope.getTotalIncomeLoss = function() {
		var total = 0;
		for (var i = 0; i < $scope.stockPositions.length; i++) {
			var stockPos = $scope.stockPositions[i];
			total += stockPos.incomeLoss;
		}
		return total;
	}
	$scope.getTotalSpent = function() {
		var total = 0;
		for (var i = 0; i < $scope.stockPositions.length; i++) {
			var stockPos = $scope.stockPositions[i];
			total += stockPos.spent;
		}
		return total;
	}
	$scope.getIncomyStocksQty = function() {
		var total = 0;
		for (var i = 0; i < $scope.stockPositions.length; i++) {
			var stockPos = $scope.stockPositions[i];
			if (stockPos.welth == "incomy") {
				total++;
			}
		}
		return total;
	}
	$scope.getLossyStocksQty = function() {
		var total = 0;
		for (var i = 0; i < $scope.stockPositions.length; i++) {
			var stockPos = $scope.stockPositions[i];
			if (stockPos.welth == "lossy") {
				total++;
			}
		}
		return total;
	}
	$scope.add = function() {
		//check if array already contains position
		var positionExists = false;
		for (var i = 0; i < $scope.stockPositions.length; i++) {
			if ($scope.stockPositions[i].name == $scope.stock.name) {
				positionExists = $scope.stockPositions[i];
				break;
			}
		}
		if (positionExists) { //edit stockPosition
			if (parseInt($scope.stock.quantity) != 0) {
				//count average price
				positionExists.average =
					(
						(
							parseInt($scope.stock.buyPrice) * parseInt($scope.stock.quantity)
						) + (
							parseInt(positionExists.average) * parseInt(positionExists.quantity)
						)
					) / (
						parseInt($scope.stock.quantity) + parseInt(positionExists.quantity)
					);
				//count quantity
				positionExists.quantity = parseInt(positionExists.quantity) + parseInt($scope.stock.quantity);
				//recount income
				if (parseInt(positionExists.curPrice) > 0) {
					positionExists.recountIncome(positionExists);
				}
			}
		} else { //add stockPosition
			$scope.stockPositions.push({
				name: $scope.stock.name,
				average: $scope.stock.buyPrice,
				quantity: $scope.stock.quantity,
				curPrice: 0,
				incomeLoss: 0,
				colCurPriceClass: ' stateUnset',
				colIncomeLossClass: ' stateUnset',
				additionalCssClass: '',
				curPriceEdit: '',
				status: 0,
				welth: "neutral",
				setCurPrice: function() {
					this.colCurPriceClass = ' stateSeting';
				},
				recountIncome: function(stockPositionObj) {
					var spo = stockPositionObj;
					spo.incomeLoss = (parseInt(spo.curPrice) * parseInt(spo.quantity)) - (parseInt(spo.average) * parseInt(spo.quantity));
					spo.spent = spo.quantity * spo.curPrice;
					if (spo.incomeLoss < 0) {
						spo.additionalCssClass = ' lossy';
						spo.status = -1;
						spo.welth = "lossy";
					}
					if (spo.incomeLoss > 0) {
						spo.additionalCssClass = ' incomy';
						spo.status = -1;
						spo.welth = "incomy";
					}
					if (spo.incomeLoss == 0) {
						spo.additionalCssClass = ' neutral';
						spo.status = 0;
						spo.welth = "neutral";
					}
				},
				saveCurPrice: function() {
					if (parseInt(this.curPriceEdit) > 0) {
						this.curPrice = parseInt(this.curPriceEdit);
						this.colCurPriceClass = ' stateSet';
						this.colIncomeLossClass = ' stateSet';
						this.recountIncome(this);
					} else {
						alert('Указанная Вами цена не может быть применена');
					}
				}
			});
		}
	};
});
