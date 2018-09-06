var budgetController = (function() {
	
	var Expense = function( id, description, value){
		this.id = id;
		this.description = description;
		this.value = value;
		this.percentage = -1;
	};
	
	Expense.prototype.calcPercentage = function(totalIncome){
		if(totalIncome>0)
			this.percentage = Math.round(this.value/totalIncome*100);
		else this.percentage = -1;
		
	};
	
	Expense.prototype.getPercentage = function(){
		return this.percentage;
	};

	var Income = function( id, description, value){
		this.id = id;
		this.description = description;
		this.value = value;
	};

	
	var calculateSum = function(type) {
		var sum = 0;
		
		data.allItems[type].forEach(function(current){
			sum+=current.value;
		});
		
		data.allTotals[type] = sum;
	};
	
	var data = {
		allItems : {
			exp: [],
			inc: []
		},
		
		allTotals : {
			exp: 0,
			inc: 0
		},
		budget: 0,
		percentage: -1
	};
	
	return {
		addItem: function(type,desc,val){
			var newItem,ID;
			if(data.allItems[type].length >0)
				ID = data.allItems[type][data.allItems[type].length - 1].id+1
			else ID = 0;
			if(type === 'exp')
				newItem = new Expense(ID, desc,val);
			else if(type === 'inc')
				newItem = new Income(ID,desc,val);
			data.allItems[type].push(newItem);
			return newItem;
		},
		
		deleteItem: function(type,id){
			
			var ids = data.allItems[type].map(function(current){
				return current.id;				
			});
			var index = ids.indexOf(id);
			if(index !== 1)
				data.allItems[type].splice(index,1);
			
		},
		
		calculateBudget: function() {
			//Calculate the total income and expenses
			calculateSum('inc');
			calculateSum('exp');
			
			//Calculate the budget
			data.budget = data.allTotals.inc - data.allTotals.exp;
			
			
			//Calculate the percentage
			if(data.allTotals.inc>0)
				data.percentage = Math.round((data.allTotals.exp/data.allTotals.inc)*100);
			else data.percentage=-1;
			
		},
		
		calculatePercentage: function() {
			
			data.allItems.exp.forEach(function(current){
				current.calcPercentage(data.allTotals.inc);
			});
		},
		
		getPercentage: function(){
			var allPerc = data.allItems.exp.map(function(current){
				return current.getPercentage();
			});
			return allPerc;
		},
		
		getBudget: function() {
			return {
				budget:data.budget,
				totalIncome:data.allTotals.inc,
				totalExpense:data.allTotals.exp,
				percentage:data.percentage,
			};
		}
	
	}
})();






var UIController = (function() {

	var DOMStrings = {
		
		inputType:'.add__type',
		descriptionTYpe:'.add__description',
		valueType:'.add__value',
		buttonType: '.add__btn',
		incomeContainer: '.income__list',
		expenseContainer: '.expenses__list',
		incomeLabel:'.budget__income--value',
		expenseLabel:'.budget__expenses--value',
		percentageLabel:'.budget__expenses--percentage',
		budgetLabel:'.budget__value',
		container:'.container',
		expperecentageLabel:'.item__percentage',
		dateLabel:'.budget__title--month'
	};
	
			
	var formatNumber = function(number,type){
			
		number = Math.abs(number);
		number = number.toFixed(2);
		var numSPlit = number.split('.');
		var integer = numSPlit[0];
		var dec = numSPlit[1];
		if(integer.length>3)
			integer = integer.substr(0,integer.length - 3)+','+integer.substr(integer.length - 3,3);
		type === 'exp' ? sign = '-' :sign = '+';
			
		return sign+' '+integer+'.'+dec;
	};
	var nodeListForEach = function(list, callback){
		for(var i=0;i<list.length;i++)
			callback(list[i],i);
	};

	return {

		getInput : function() {
			
			return {
				type: document.querySelector(DOMStrings.inputType).value,
				description: document.querySelector(DOMStrings.descriptionTYpe).value,
				value: parseFloat(document.querySelector(DOMStrings.valueType).value)
			}
		},
		
		addListItem : function(obj,type) {
			
			
			var html, element;
			//Create HTML tags with placeholder tags
			if(type === 'inc') {
				element = DOMStrings.incomeContainer;
				html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
			}else if (type === 'exp'){
				element = DOMStrings.expenseContainer;
				html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
			}			
			//Replace the placehode text
			html = html.replace('%id%', obj.id);
			html= html.replace('%description%',obj.description);
			html= html.replace('%value%', formatNumber(obj.value, type));
			
			//Insert HTML to the DOM
			document.querySelector(element).insertAdjacentHTML('beforeend',html);
			
		},
		
		deleteListItem: function(selectorID){
			
			var element = document.getElementById(selectorID);
			element.parentNode.removeChild(element);
		
		},
		
		clearFields: function() {
				var fields = document.querySelectorAll(DOMStrings.descriptionTYpe + ',' +DOMStrings.valueType);
				var fieldsArr = Array.prototype.slice.call(fields);
				fieldsArr.forEach(function(current,index,array){
					current.value="";
				});
				fieldsArr[0].focus();
		},
		
		displayBudget: function(obj){
			var type;
			obj.budget>0 ? type = 'inc' : type = 'exp';
			document.querySelector(DOMStrings.budgetLabel).textContent = formatNumber(obj.budget,type);;
			document.querySelector(DOMStrings.incomeLabel).textContent = formatNumber(obj.totalIncome, 'inc');
			document.querySelector(DOMStrings.expenseLabel).textContent = formatNumber(obj.totalExpense, 'exp');
			if(obj.percentage>0)
				document.querySelector(DOMStrings.percentageLabel).textContent = obj.percentage+'%';
			else document.querySelector(DOMStrings.percentageLabel).textContent = '---';
		},
		
		displayPercentage: function(percentages){
			var fields = document.querySelectorAll(DOMStrings.expperecentageLabel);
		
			nodeListForEach(fields, function(current,index){
				if(percentages[index] >0)
					current.textContent = percentages[index] + '%';
				else current.textContent = '---';
				
			});
		},

		displayMonth: function(){
			
			var now = new Date();
			var year = now.getFullYear();
			var month = now.getMonth();
			var months= ['January', 'February','March','April','May','June','July','August','September','October','November','December'];
			document.querySelector(DOMStrings.dateLabel).textContent = months[month] + ' '+ year;
		},
		changeType: function(){
			
			var fields = document.querySelectorAll(DOMStrings.inputType+','+DOMStrings.descriptionTYpe+','+DOMStrings.valueType);	
			nodeListForEach(fields, function(current) {
				current.classList.toggle('red-focus');
			});
			document.querySelector(DOMStrings.buttonType).classList.toggle('red');
			
		},
		
		getDOMString : function() {
			return DOMStrings;
		}
	};

})();





var Controller = (function(budgetCtrl, UICtrl) {
	
	
	var setUpEventListeners = function() {
			
		var DOM = UICtrl.getDOMString();
		document.querySelector(DOM.buttonType).addEventListener('click', ctrlAddItem);
	
		document.addEventListener('keypress', function(event) {
			if(event.keyCode === 13 || event.which === 13){
				ctrlAddItem();
			}
		});
		
		document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
		
		document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changeType);
	};
	
	var updateBudget = function(){
		
		//Calculate the budget
		budgetCtrl.calculateBudget();
		
		//Return the budget
		var budget = budgetCtrl.getBudget();
		//Display the budget on the UI
		UICtrl.displayBudget(budget);
	};
	
	var updatePercentage = function() {
		
		//Calculate the percentages
		budgetCtrl.calculatePercentage();
		
		//Fetch the percentage from budget controllers
		var percentages = budgetController.getPercentage();
		
		//Update in the UI
		UICtrl.displayPercentage(percentages);
	};
		
	var ctrlAddItem = function() {
		
		//Get the field input data
		var input = UICtrl.getInput();
		if(input.description !== "" && !isNaN(input.value) && input.value >0){
		
			//Add the item to the budget controllers
			var newItem = budgetCtrl.addItem(input.type, input.description,input.value);
			
			//Add the item to the UI
			UICtrl.addListItem(newItem, input.type);
			//Clear the fields
			UICtrl.clearFields();
			
			//Calculate and Update the budget
			updateBudget();
			
			//Calculate and update Percentage
			updatePercentage();
		}

	};
	
	var ctrlDeleteItem = function(event) {
		var itemID;
		itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
		if(itemID){
			var splitID = itemID.split('-');
			var type = splitID[0];
			var ID = parseInt(splitID[1]);
			
			//delete the item from datastructure
			budgetCtrl.deleteItem(type,ID);
			
			//delete the item from the UI
			UICtrl.deleteListItem(itemID);
			
			//update the new budget
			updateBudget();
			
			//Calculate and update Percentage
			updatePercentage();
		}
		
	};
	
	return {
		init: function() {
			UICtrl.displayMonth();
			UICtrl.displayBudget({
			budget:0,
			totalIncome:0,
			totalExpense:0,
			percentage:-1,
		});
			setUpEventListeners();
		}
			
	};
		
})(budgetController, UIController);


Controller.init();


