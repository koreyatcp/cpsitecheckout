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
var backend_url = 'https://chartprime-checkout-temp.herokuapp.com/api';
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
function openChargebee(item_price_id, email) {
  return new Promise((resolve, reject) => {
    $.post(`${backend_url}/generate_checkout_new_url?email=${email}&item_price_id=${item_price_id}&coupon=${couponCode}&rfsn=${resecation}`, function(data) {
      if (data) {
        resolve(data);
      } else {
        reject("API call failed");
      }
    });
  })
  .then((data) => {
  	console.log(data.data);
    if(data.data === "Customer already exists"){
		if (window.innerWidth < 991) {window.location.href = 'https://chartprime-test.chargebee.com/portal/v2/login?forward=home';} else {var el = document.querySelector('.login_link');el.click();}
    }else{
      cbInstance.openCheckout({
      hostedPage: function() {
        return $.post(`${backend_url}/generate_checkout_new_url?email=${email}&item_price_id=${item_price_id}&coupon=${couponCode}&rfsn=${resecation}`);
      },
      loaded: function() {
        console.log("Checkout opened");
      },
      error: function(data) {
        $("#loader").hide();
        $("#errorContainer").show();
      },
      close: function() {
        $("#loader").hide();
        $("#errorContainer").hide();
        console.log("Checkout closed");
      },
      success: function(hostedPageId, checkoutData) {
        console.log(hostedPageId);
        console.log('Checkout success', checkoutData);
        location.href = "https://chartprime.com/thank-you?rfsn_ci=" + checkoutData?.subscription?.id;
      },
      step: function(value) {
        console.log(value);
      }
    });
    }    
  })
  .catch((error) => {
    console.error("API call failed:", error);
  });
}

function setChargebeeCallback() {
  cbInstance.setCheckoutCallbacks(function(cart) {
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
  $("#label-checkout-mode").html("$143 Quarterly Subscription");
  resetCheckoutForm();
});

$("#activate_year_btn").click(function() {
	currentPlanId = "vital-algo-yearly";
  if (typeof getUrlParameter(couponCodeURLCODE) !='undefined'){couponCode = getUrlParameter(couponCodeURLCODE);}
  $("#label-checkout-mode").html("$489 Yearly Subscription");
  resetCheckoutForm();
});

$("#activate_lifetime_btn").click(function() {
	currentPlanId = "lifetime_plan";
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

    cardComponent.createField("number").at("#card-credit");
    cardComponent.createField("expiry").at("#card-expiry");
    cardComponent.createField("cvv").at("#card-cvv");
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

  $("#round-step1").attr("class", "round-step-inactive");
  $("#label-step1").attr("class", "label-step-inactive");
  $("#round-step2").attr("class", "round-step-active");
  $("#label-step2").attr("class", "label-step-active");
  hbsptForm.find("[name='email']").val($("#account-email").val());
  hbsptForm.submit();
  currentCheckoutStep = 1;
});
$("#btn-back-step").click(function() {
	$("#account-info-group").show();
  $("#billing-info-group").hide();

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
    site: "chartprime",
    domain: "https://chartprime.chargebee.com/",
    publishableKey: "live_GslYJJq3Mpy9M8Qo3J5rfduG995XPto0",
    enableGATracking: true,
    enableGTMTracking: true,
    enableRefersionTracking: true
  });
  setLeadDynoTracking();
  $("#checkout-form").attr("onkeydown", "return event.key != 'Enter';")
  setChargebeeCallback();
  loadCountries();
  hideLoading();
});

