var accordion = (function(){  
  var $accordion = $('.js-accordion');
  var $accordion_header = $accordion.find('.js-accordion-header');
  var $accordion_item = $('.js-accordion-item');
  var settings = {speed: 0,oneOpen: false};
  return {
    init: function($settings) {
      $accordion_header.on('click', function() {
        accordion.toggle($(this));
      });      
      $.extend(settings, $settings);
      if(settings.oneOpen && $('.js-accordion-item.active').length > 1) {
        $('.js-accordion-item.active:not(:first)').removeClass('active');
      }
      $('.js-accordion-item.active').find('> .js-accordion-body').show();
    },
    toggle: function($this) {            
      if(settings.oneOpen && $this[0] != $this.closest('.js-accordion').find('> .js-accordion-item.active > .js-accordion-header')[0]) {
        $this.closest('.js-accordion')
               .find('> .js-accordion-item') 
               .removeClass('active')
               .find('.js-accordion-body')
               .slideUp()
 }
 $this.closest('.js-accordion-item').toggleClass('active');
 $this.next().stop().slideToggle(settings.speed);
    }
  }
})();

var cbInstance;
var cb_options = {};
var couponCode = '';
var couponCodeURLCODE = 'coupon';
var currentPlanId = 'vital-algo-monthly';
// var backend_url = 'https://peaceful-garden-29242.herokuapp.com/api';
var backend_url = 'https://chartprime-checkout-testing-63c049f5f085.herokuapp.com/api';
function getUrlParameter(sParam) {		
			var sPageURL = window.location.search.substring(1);
			var sURLVariables = sPageURL.split('&');
			for (var i = 0; i < sURLVariables.length; i++)
			{
				var sParameterName = sURLVariables[i].split('=');
				if (sParameterName[0] == sParam)
				{
					return sParameterName[1];
				}
			}
    }
var sParam = 'rfsn';
var newvar = getUrlParameter(sParam);
var resecation ='';
if(newvar){
	resecation = newvar;
}
console.log('test rsfn',resecation);
function openChargebee(plan_id, email) {
	cbInstance.openCheckout({
    hostedPage: function() {
      return $.post(`${backend_url}/generate_checkout_new_url?email=${email}&plan_id=${plan_id}&coupon=${couponCode}&rfsn=${resecation}`);
    },
    loaded: function() {
      console.log("checkout opened");
    },
    error: function() {
      $("#loader").hide();
      $("#errorContainer").show();
    },
    close: function() {
      $("#loader").hide();
      $("#errorContainer").hide();
      console.log("checkout closed");
    },
    success: function(hostedPageId, data) {
    	console.log(hostedPageId);
      console.log('checkout success', data);
      // console.log("thanks you page called from openChargebee");
      location.href = "https://chartprime.com/thank-you?rfsn_ci=" + data?.subscription?.id;    
    },
    step: function(value) {
      // value -> which step in checkout
      console.log(value);
    }
  });
}

function setChargebeeCallback() {
  cbInstance.setCheckoutCallbacks(function(cart) {
    // you can define a custom callbacks based on cart object
    return {
      loaded: function() {
        console.log("checkout opened");
      },
      close: function() {
        console.log("checkout closed");
      },
      success: function(hostedPageId, data) {
      	location.href = "https://chartprime.com/thank-you?rfsn_ci=" + data?.subscription?.id;
        console.log("thanks you page called setChargebeeCallback");
      },
      step: function(value) {
        
        console.log(value);
      }
    }
  });
}

function resetCheckoutForm() {
	$("#checkout-form")[0].reset();
  currentCheckoutStep = 0;
  isCouponSuccess = false;
  $("#btn-back-step").trigger("click");
  $("#checkout-form").find(".label-input-error").html("");
  $("#checkbox").prev().removeClass("w--redirected-checked");
  $("#checkbox-2").prev().removeClass("w--redirected-checked");
  $("#bill-country")[0].selectedIndex = 0;
  
  $("#bill-coupon-link").show();
  $("#bill-coupon").hide();
  $("#bill-coupon-apply").hide();
  $("#bill-discount-price").hide();
  $("#bill-discount-price").html(``);
}

// connect subscribe buttons and variables
$("#activate_month_btn").click(function() {
	currentPlanId = "vital-algo-monthly";
  if (typeof getUrlParameter(couponCodeURLCODE) !='undefined'){couponCode = getUrlParameter(couponCodeURLCODE);}
  $("#label-checkout-mode").html("$47 Monthly Subscription");
  resetCheckoutForm();
});

$("#activate_quarter_btn").click(function() {
	currentPlanId = "vital-algo-quarterly";
  if (typeof getUrlParameter(couponCodeURLCODE) !='undefined'){couponCode = getUrlParameter(couponCodeURLCODE);}
  $("#label-checkout-mode").html("$97 Quarterly Subscription");
  resetCheckoutForm();
});

$("#activate_year_btn").click(function() {
	currentPlanId = "vital-algo-yearly";
  if (typeof getUrlParameter(couponCodeURLCODE) !='undefined'){couponCode = getUrlParameter(couponCodeURLCODE);}
  $("#label-checkout-mode").html("$342 Yearly Subscription");
  resetCheckoutForm();
});

$("#activate_lifetime_btn").click(function() {
	currentPlanId = "copy_of_life-time";
  if (typeof getUrlParameter(couponCodeURLCODE) !='undefined'){couponCode = getUrlParameter(couponCodeURLCODE);}
  $("#label-checkout-mode").html("$1195 Lifetime Subscription");
  resetCheckoutForm();
});

var cardComponent;
function loadComponents() {
	cbInstance.load('components').then(() => {
    // create cardc ompondnt
  	cardComponent = cbInstance.createComponent("card",
    	{
      	placeholder: {
          number: "Enter card number",
          expiry: "Enter expiry date",
          cvv: "Enter CVV",
        },
        classes: {
          focus: 'focus',
          invalid: 'invalid',
          empty: 'empty',
          complete: 'complete',
        },
        style: {
          // override styles for default state
          base: {
            width: '100%',
            height: '38px',
            padding: '8px 12px',
            marginBottom: '10px',
            verticalAlign: 'middle',
            background: 'white !important',
            border: '1px solid #ccc',
            color: '#333',
            fontSize: '14px',
            '::placeholder': {
              color: 'transparent',
 },
 },

          invalid: {
            color: '#EE0000',
            '::placeholder': {
              color: '#EE0000',
 },
 }
 }
 }
    );
    // create card fields
    cardComponent.createField("number").at("#card-credit");
    cardComponent.createField("expiry").at("#card-expiry");
    cardComponent.createField("cvv").at("#card-cvv");
    // mount card component
    cardComponent.mount();
	});
}
$("#checkout-form").on("submit", function(event) {
  event.preventDefault();
  showLoading(); 
  checkValidation().then(valid => {
  	if (!valid) {
    	hideLoading();
    	return;
    }
    cbInstance.tokenize(cardComponent, {
      firstName: $("#bill-firstname").val(),
      lastName: $("#bill-lastname").val(),
      billingAddr1: $("#bill-address").val(),
      billingAddr2: $("#bill-address2").val(),
      billingCity: $("#bill-city").val(),
      billingCountry: $("#bill-country").val(),
      billingZip: $("#bill-zipcode").val()
    }).then(data => {
      create_subscription(data.token);
    })
    .catch(err => {
    	hideLoading();
      console.error('token-error', err);
      alert('checkout failed');
    });
  });
  return false;
});
$("#btn-next-step").click(async function() {
  if (!await checkValidation())
  	return;
	$("#account-info-group").hide();
  $("#billing-info-group").show();
  // activate 2nd step
  $("#round-step1").attr("class", "round-step-inactive");
  $("#label-step1").attr("class", "label-step-inactive");
  $("#round-step2").attr("class", "round-step-active");
  $("#label-step2").attr("class", "label-step-active");
  // Hubspot Form submit
  hbsptForm.find("[name='email']").val($("#account-email").val());
  hbsptForm.submit();
  currentCheckoutStep = 1;
});
$("#btn-back-step").click(function() {
	$("#account-info-group").show();
  $("#billing-info-group").hide();
  
  // activate 1st step
  $("#round-step2").attr("class", "round-step-inactive");
  $("#label-step2").attr("class", "label-step-inactive");
  $("#round-step1").attr("class", "round-step-active");
  $("#label-step1").attr("class", "label-step-active");
  
  currentCheckoutStep = 0;
});

$("#bill-coupon-link").click(() => {
  $("#bill-coupon").show();
  $("#bill-coupon-apply").show();
});

$("#bill-coupon-apply").click(() => {
	if ($("#bill-coupon").val() == "") {
  	return;
  }
	showLoading();
	checkValidation().then(valid => {
  	if (!valid) {
    	hideLoading();
    	return;
    }
    cbInstance.tokenize(cardComponent, {
      firstName: $("#bill-firstname").val(),
      lastName: $("#bill-lastname").val(),
      billingAddr1: $("#bill-address").val(),
      billingAddr2: $("#bill-address2").val(),
      billingCity: $("#bill-city").val(),
      billingCountry: $("#bill-country").val(),
      billingZip: $("#bill-zipcode").val()
    }).then(data => {
      cart_sub_create(data.token);
    })
    .catch(err => {
    	hideLoading();
      console.error('coupon-error', err);
      alert('applying coupon failed');
    });
  });
});
$(document).ready(function(){
  accordion.init({ speed: 0, oneOpen: false });
  cbInstance = window.Chargebee.init({
  	site: "chartprime-test",
    domain: "https://chartprime-test.chargebee.com/",
    publishableKey: "test_NWcuqs5QVpCW8tPhn2EdKrOdF1o7BCXrs",
    // site: "chartprime",
    // domain: "https://chartprime.chargebee.com/",
    // publishableKey: "live_GslYJJq3Mpy9M8Qo3J5rfduG995XPto0",
    enableGATracking: true,
    enableGTMTracking: true,
    enableRefersionTracking: true
  });
  setLeadDynoTracking();
  
  // remove enter event of checkout form
  $("#checkout-form").attr("onkeydown", "return event.key != 'Enter';")
  setChargebeeCallback();
  // loadComponents();
  loadCountries();
  hideLoading();
});
