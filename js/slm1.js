//saves writing console.log. probably not a good idea
var disp = function(x) {
  console.log(x);  
};

//We have four controllers
//dataContoller that handles data. It will be developed later
//inputController handles all input
//outputController that handles output to the screen
//controller that calls the other controllers
//inputController and outputController sort of straddle UIController
//in the original project
//NB:
//Positive cashflows (incomes) are displayed in black
//Negative cashflows (expense) are displayed in red
//Cancelled cashflows are displayed in grey but are never actually deleted
//If the net total is negative it is displayed in red


var dataController = (function(){
    return {
        allData: [],
        calcTotals: function(data) {
            n = data.length;
            var expTot = 0;
            var incTot = 0;
            for (var i=0; i<n; i++) {
                if (data[i].status === 'active') {
                    if (data[i].type === 'inc') {
                        incTot+= data[i].amount;
                    } else if (data[i].type === 'exp') {
                        expTot+= data[i].amount;
                    } else {
                        disp('MAJOR FUCKUP!!!!!!!!');
                    }; // end if else
                    
                }; //end if
            }; // end FOR LOOP
            var netTot = incTot - expTot;
            return [incTot, expTot, netTot];
        } // end function calcTotals
     }; // end return object

})(); // end dataController


//inputController does the screen inputs
var inputController = (function() {
    
    var Strings = {
        goBtnId: 'go',
        descId: 'description',
        typeId: 'type',
        amountId: 'amount'
    }// end the strings
    
    return {
        getData: function() {
            var desc = document.getElementById('description').value;
            var type = document.getElementById('type').value;
            var x = document.getElementById('amount').value;
            var amount = Number(x);
            return {
              description: desc,
                type: type,
                amount: amount,
                status: 'active'
            };
        },
        theStrings: Strings
        
    }; // end return object
    
})(); // end input controller

//Screen output functions
var outputController = (function() {
    return {
        makeOutputTemplate: function() {
            var listHTML = '<li>  <ul class="sub-list list-inline">';
            listHTML+='<li class="index list-inline-item">%index%</li>';
            listHTML+= '<li class="desc list-inline-item">%desc%</li>';
            listHTML+= '<li class="%nbr-class%">%amount%</li>';
            listHTML+= '<li class="list-inline-item btn-or-span">';
            listHTML+= '%button-or-X%</li>';
            listHTML+= '</ul></li>';
            return listHTML;
            
        },
// these are the line items        
        makeOutputStrings: function(template, data) {
            let n = data.length;
            var expTot = 0;
            var incTot = 0;
            var elem = document.getElementById('lists');
            //elem.innerHTML='';   ************************
            let z = '';
            for (let i = 0; i < n; i++) {
                let y = template;
                y = y.replace('%index%', i);
                y = y.replace('%type%', data[i].type);
                var nbrClass = 'nbr list-inline-item amt';
                
                switch (true) {
                    case (data[i].status != 'active'): 
                        nbrClass+= ' grey';
                        break;
                    case (data[i].type === 'exp'):
                        nbrClass += ' red';
                        break;
                    default:
                        nbrClass+= ' black';
                        
                }; // end switch
                
                y = y.replace('%nbr-class%', nbrClass);
                
                /*
                if (data[i].type === 'exp') {
                    y = y.replace('%nbr-class%', 'nbr list-inline-item amt red');
                } else {
                    y = y.replace('%nbr-class%', 'nbr list-inline-item amt');                    
                }; // end if else
                */
                y = y.replace('%desc%', data[i].description);
                let x1 = data[i].amount;
//we want the amount as a currency formatted number for output
                let x2 = x1.toLocaleString('en-US', {style:'currency', currency:'USD'});
//but we don't want the dollar sign. Must be a better way of doing this
                x2 = x2.replace('$', '');

                y = y.replace('%amount%', x2);
                if (data[i].status === 'active') {
                    var placeholder1 = '<button class="btn btn-primary"';
                    placeholder1+= 'id="' + i + '">del</button>';

                } else {
                    var placeholder1 = '<span class="red-X">X</span>';
                }
                y = y.replace('%button-or-X%', placeholder1);

                z+= y;
            }; // end for
            z = '<ul id="main-list">' + z + '</ul>';
            elem.innerHTML = z;

        },
// these are the totals        
        dispTotals: function(totals, template) {
            var n = totals.length;
            var descs = ['Income Total', 'Expense Total', 'Net Total'];
            var nbrClass;

            for (var i=0; i<n; i++) {
                var y = template;
                y = y.replace('%index%', '');
                y = y.replace('%desc%', descs[i])
                let x1 = totals[i];
                if (x1 < 0) {
                    x2 = -x1;
                } else {
                    x2 = x1;
                }

                let x3 = x2.toLocaleString('en-US', {style:'currency', currency:'USD'});
                x3 = x3.replace('$', '');
                if (i === 1) {
                    nbrClass = 'list-inline-item rednbrtot';
                } else if (i===2 && x1 < 0) {
                    nbrClass = 'list-inline-item rednbrtot';
                } else {
                    nbrClass = 'list-inline-item nbrtot';
                }; // end if else
                
                y = y.replace('%nbr-class%', nbrClass);
                y = y.replace('%amount%', x3);
                y = y.replace('%button-or-X%', '');
                document.getElementById('main-list').insertAdjacentHTML('beforeend', y);

            }; // end for
        },
// these are utility functions        
        hideSomething: function(selector1) {
            var x = document.querySelector(selector1);
            x.classList.add('hide1');
        },
        displaySomething: function(selector1) {
            var x = document.querySelector(selector1);
            x.classList.remove('hide1');
        },
        clearForm: function() {
            document.getElementById('description').value = '';
            document.getElementById('amount').value = '';
            
        }
        
    }; // end return object


    
})(); // end outputController



var controller = (function(inputCtrl, dataCtrl, outputCtrl) {
    
    var setupEventListeners = function(template) {
        var btnId = inputCtrl.theStrings.goBtnId;
        
        //Add item after inputting data
        var goBtn = document.getElementById(btnId);
        
        //displays list of inputs
        var dispBtn = document.getElementById("disp-output");
        
        //displays the input form
        var inputBtn = document.getElementById("disp-input");
        
        //deletes an item & reclaculates totals
        var delBtns = document.getElementById('lists');
        
        //Input another item
        var newItemBtn = document.getElementById('another-item');


        goBtn.addEventListener('click', function(){
            inputObj = inputCtrl.getData();
            dataCtrl.allData.push(inputObj);
            outputCtrl.displaySomething('#form-container1 .result-class');
            outputCtrl.hideSomething('#go');
            //outputCtrl.makeOutputStrings(template, dataCtrl.allData);
        });// end goBtn
        
        dispBtn.addEventListener('click', function() {
            outputCtrl.displaySomething('#lists');
            //document.getElementById("lists").classList.remove("hide");
            //document.getElementById("form-container1").classList.add("hide");
            outputCtrl.hideSomething('#form-container1');
            outputCtrl.makeOutputStrings(template, dataCtrl.allData);
            var totals = dataCtrl.calcTotals(dataCtrl.allData);
            outputCtrl.dispTotals(totals, template);
            outputCtrl.hideSomething('#disp-output');
            outputCtrl.displaySomething('#disp-input');
        }); // end dispBtn
        
        inputBtn.addEventListener('click', function(){
            //document.getElementById("lists").classList.add("hide");
            outputCtrl.hideSomething('#lists');
            
            //document.getElementById("form-
            //container1").classList.remove("hide");
            outputCtrl.displaySomething('#form-container1');
            outputCtrl.hideSomething('#form-container1 .result-class');
            outputCtrl.clearForm();
            outputCtrl.hideSomething('#disp-input');
            outputCtrl.displaySomething('#disp-output');
            outputCtrl.displaySomething('#go');
        });// end dispBtn
        
        newItemBtn.addEventListener('click', function() {
            //outputCtrl.hideSuccessDiv();
            outputCtrl.hideSomething('#form-container1 .result-class');
            outputCtrl.clearForm();
            outputCtrl.displaySomething('#go');
        }); // end newItemBtn
        
        delBtns.addEventListener('click', function(e) {
            var id = -1;
            if (e.target.id && e.target.nodeName==='BUTTON') {
                var id = parseInt(e.target.id, 10);
                dataCtrl.allData[id]['status'] = 'inactive';
                //var z = '<span class="red-X">X</span>';
                //var elem = e.target.parentElement;
                outputCtrl.makeOutputStrings(template, dataCtrl.allData);
                //elem.innerHTML = z;
                var totals = dataCtrl.calcTotals(dataCtrl.allData);
                outputCtrl.dispTotals(totals, template);
                
                //document.getElementById('li' + id).innerHTML = z;

            }
            return id;

        }); // end delBtns
        
        
    }; // end setupEventListeners
    
    return {
        init: function(x) {
            disp(x);
            var template = outputCtrl.makeOutputTemplate();
            setupEventListeners(template);
            //outputCtrl.hideSomething('#form-container1 .result-class');
            //outputCtrl.hideSomething('#disp-input');
        }
        
    }; // end return object
    
})(inputController, dataController, outputController); // end controller

controller.init('Hi from init 2');
