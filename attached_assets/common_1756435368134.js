//Grobal
var current_view = 'pc'; //Viewport State
var ww = $(window).width(); //Window Width
var wh = $(window).height(); //Window Height
var user_scroll = $(window).scrollTop(); //Scroll Position

var filter_investmenttype = 'all';
var filter_country = 'all';
var filter_businesstype = 'all';

/////////////////////////////////////////////
/* Init */
/////////////////////////////////////////////
$(document).ready(function(){
	ww = $(window).width();
	wh = $(window).height();
	user_scroll = $(window).scrollTop();
		
	setTimeout(function(){
		$(window).resize();
		checkViewsizeAndOverflow();
		checkAnimation();
    if($('#index').length) {
      while ($('#index .main .portfolio .logolist a').length < 100) {
        $('#index .main .portfolio .logolist').append($('#index .main .portfolio .logolist').html());
      }
    }
	}, 100);
	setTimeout(function(){
    $('#index .visual, #inner .visual').addClass('show');
	}, 300);
  
  if($('.archive.portfolio').length) {
    var company_num = Number($('#inner.archive.portfolio .visual .counter .company span').text());
    var country_num = Number($('#inner.archive.portfolio .visual .counter .country span').text());
    var company_num_now = 0;
    var country_num_now = 0;
    var timer1 = setInterval(function(){
      company_num_now += Math.ceil(company_num/100);
      if(company_num_now > company_num) company_num_now = company_num;
      $('#inner.archive.portfolio .visual .counter .company span').text(company_num_now);
      if(company_num_now == company_num) clearInterval(timer1);
    }, 10);
    var timer2 = setInterval(function(){
      country_num_now += Math.ceil(country_num/100);
      if(country_num_now > country_num) country_num_now = country_num;
      $('#inner.archive.portfolio .visual .counter .country span').text(country_num_now);
      if(country_num_now == country_num) clearInterval(timer2);
    }, 30);
    
    $('#inner.archive.portfolio .visual .filter .box .bt > a').on('click', function(){
      $(this).next().slideToggle(200);
    });
    
    $('#inner.archive.portfolio .visual .filter .box1 ul li a').on('click', function(){
      var target = $(this).text();
      var target_param = $(this).attr('investmenttype');
      if(!target_param) target_param = 1;
      
      $('#inner.archive.portfolio .visual .filter .box1  .bt > a span').html(target);
      $('#inner.archive.portfolio .visual .filter .box1  ul').slideToggle(200);
      
      filter_investmenttype = target_param;
      filterPortfolio();
    });    
    $('#inner.archive.portfolio .visual .filter .box2 ul li a').on('click', function(){
      var target = $(this).text();
      var target_param = $(this).attr('country');
      $('#inner.archive.portfolio .visual .filter .box2  .bt > a span').html(target);
      $('#inner.archive.portfolio .visual .filter .box2  ul').slideToggle(200);
      
      filter_country = target_param;
      filterPortfolio();
    });    
    $('#inner.archive.portfolio .visual .filter .box3 ul li a').on('click', function(){
      var target = $(this).text();
      var target_param = $(this).attr('businesstype');
      $('#inner.archive.portfolio .visual .filter .box3  .bt > a span').html(target);
      $('#inner.archive.portfolio .visual .filter .box3  ul').slideToggle(200);
      
      filter_businesstype = target_param;
      filterPortfolio();
    });    
    
    
    
    
    if(getParam('type') == 'buyout') {
      $('#inner.archive.portfolio .visual .filter .box1  .bt > a span').html('バイアウト投資');
      filter_investmenttype = getParam('type');
      filterPortfolio();      
    }
    if(getParam('type') == 'growthequity') {
      $('#inner.archive.portfolio .visual .filter .box1  .bt > a span').html('グロースエクイティ投資');
      filter_investmenttype = getParam('type');
      filterPortfolio();      
    }
    if(getParam('type') == 'secondary') {
      $('#inner.archive.portfolio .visual .filter .box1  .bt > a span').html('セカンダリー投資');
      filter_investmenttype = getParam('type');
      filterPortfolio();      
    }
    if(getParam('type') == 'strategy') {
      $('#inner.archive.portfolio .visual .filter .box1  .bt > a span').html('その他戦略投資');
      filter_investmenttype = getParam('type');
      filterPortfolio();      
    }
  }
  
  $('#index .strategies .fbox section .info a').hover(function(){
    $(this).parents('.info').addClass('hover');
  }, function(){
    $(this).parents('.info').removeClass('hover');  
  });
  
	$('header .bt_menu, .sp_view header .gmenu a').on('click', function(){
		$('header .gmenu').fadeToggle(300);
		setTimeout(function(){
			$('header').toggleClass('open');
		}, 10);
	});
	$('.main .tab a').on('click', function(){
		$(this).parents('.tab').find('.active').removeClass('active');
		$(this).addClass('active');
	});
	$('#index .main .news .tab a').on('click', function(){
    $('#index .news .fbox').removeClass('active');
    $('#index .news .fbox.tab'+($(this).index()+1)).addClass('active');		
	});
	$('#index .main .teams .tab a.japan').on('click', function(){
    $('#index .main .memberlist li').hide();
    $('#index .main .memberlist li.japan').show();
	});
	$('#index .main .teams .tab a.singapore').on('click', function(){
    $('#index .main .memberlist li').hide();
    $('#index .main .memberlist li.singapore').show();
	});
	$('#index .main .teams .tab a.all').on('click', function(){
    $('#index .main .memberlist li').show();
	});
	$('.main .newslist li a').hover(function(){
    var target = $(this).parents('li');
    $(this).parents('.newslist').next().find('.thumb:nth-child('+($('.newslist li').index(target)+1)+')').addClass('active');
    console.log($('.newslist li').index(target)+1);
	}, function(){
    var target = $(this).parents('li');
    $(this).parents('.newslist').next().find('.thumb:nth-child('+($('.newslist li').index(target)+1)+')').removeClass('active');
    console.log($('.newslist li').index(target)+1);
	});
  
	if(ww >= 768){
    if(location.hash) { //ハッシュタグが有る場合
      $("body,html").scrollTop($(location.hash).offset().top - 90);
    }
	} else {
    if(location.hash) { //ハッシュタグが有る場合
      $("body,html").scrollTop($(location.hash).offset().top - 50);
    }
	}
});

function filterPortfolio(){
  $('#inner.archive.portfolio .content .portfoliolist li').each(function(){
    var show_flag = 0;
    if(
      (filter_investmenttype == 'all' ||
       $(this).attr('investmenttype') == filter_investmenttype ||
       $(this).attr('succession') == filter_investmenttype) &&
      (filter_country == 'all' ||
       $(this).attr('country') == filter_country) &&
      (filter_businesstype == 'all' ||
       $(this).attr('businesstype') == filter_businesstype)
      ){
      show_flag = 1;      
    }
    if(show_flag) $(this).show(); else $(this).hide();
  });
  
  if(filter_investmenttype != 'all') $('#inner.archive.portfolio .visual .filter .box1 .bt').addClass('filtered');
  else $('#inner.archive.portfolio .visual .filter .box1 .bt').removeClass('filtered');
  if(filter_country != 'all') $('#inner.archive.portfolio .visual .filter .box2 .bt').addClass('filtered');
  else $('#inner.archive.portfolio .visual .filter .box2 .bt').removeClass('filtered');
  if(filter_businesstype != 'all') $('#inner.archive.portfolio .visual .filter .box3 .bt').addClass('filtered');
  else $('#inner.archive.portfolio .visual .filter .box3 .bt').removeClass('filtered');
  
  if(!$('#inner.archive.portfolio .content .portfoliolist li:visible').length) $('#inner.archive.portfolio .content .portfoliolist').addClass('nohit');
  else $('#inner.archive.portfolio .content .portfoliolist').removeClass('nohit');
}

/////////////////////////////////////////////
/* Resizing */
/////////////////////////////////////////////
$(window).resize(function(){
	ww = $(window).width();
	wh = $(window).height();
	
	var past_view = current_view;
	checkViewsizeAndOverflow();
	checkAnimation();

  $('#index .visual, #inner .visual').height(wh);
	if(ww >= 768){
	} else {
				
	}
});

/////////////////////////////////////////////
/* Scrolling */
/////////////////////////////////////////////
$(window).scroll(function (){
	checkAnimation();
});

function checkAnimation(user_scroll){
	user_scroll = $(window).scrollTop();	

	var offset = 300;
  $('#inner .visual').css('background-position','50% '+(50 - user_scroll*0.1)+'%');
  $('#inner .visual .bg').css('background-position','50% '+(0 - user_scroll*0.05)+'px');
  $('#inner.about .message .bg').css('background-position','50% '+(30 - user_scroll*0.05)+'px');
  $('#inner.about .message .feature:nth-child(2) > .inner').css('background-position','50% '+(150 - user_scroll*0.1)+'px');
  $('#inner.about .message .feature:nth-child(3) > .inner').css('background-position','50% '+(225 - user_scroll*0.1)+'px');
  $('#inner.about .message .feature:nth-child(4) > .inner').css('background-position','50% '+(300 - user_scroll*0.1)+'px');
  
	if(ww >= 768){
		if(user_scroll > 300) $('header').addClass('show');
    else $('header').removeClass('show');
	} else {
		offset = 150;
		if(user_scroll > 200) $('header').addClass('show');
    else $('header').removeClass('show');
	}
	setTimeout(function(){
    scrollActive('#index .visual .lead', offset);
    scrollActive('#index .about', offset);
    scrollActive('#index .strategies', offset);
    $('#index .strategies .fbox section').each(function(){scrollActive(this, offset);});
    scrollActive('#index .news', offset);
    scrollActive('#index .portfolio', offset);
    scrollActive('#index .teams', offset);
    
    scrollActive('#inner.about .summary', offset);
    scrollActive('#inner.about .message', offset);
    scrollActive('#inner.about .history', offset);
    scrollActive('#inner.about .profile', offset);
    scrollActive('#inner.about .location', offset);
    scrollActive('#inner.about .contact', offset);
    
    $('#inner.strategies .sec').each(function(){scrollActive(this, offset);});
    
    $('#inner .bt_back a').each(function(){scrollActive(this, offset);});
    scrollActive('#inner.service .submenu', offset*0.5);

    scrollActive('#inner.equipment .submenu', offset*0.5);
    scrollActive('#inner.equipment .gallery', offset*0.5);
    $('#inner.equipment .photo .box').each(function(){scrollActive(this, offset);});
    scrollActive('#inner.equipment .equipment', offset*0.5);
    scrollActive('#inner.equipment .infection', offset*0.5);

    scrollActive('#inner.about .philosophy', offset);
    scrollActive('#inner.about .philosophy .lead', offset);
    scrollActive('#inner.about .strength', offset);
    $('#inner.about .strength .sec').each(function(){scrollActive(this, offset);});
    scrollActive('#inner.about .doctor', offset);
    $('#inner.about .doctor .sec').each(function(){scrollActive(this, offset);});

    scrollActive('#inner.faq .faq', offset*0.5);

    scrollActive('#inner.news .news', offset*0.5);
    
    scrollActive('#inner.price .price', offset*0.5);
    
    scrollActive('#inner.cancelpolicy .cancelpolicy', offset*0.5);
	}, 50);
}

/////////////////////////////////////////////
/* Other Functions */
/////////////////////////////////////////////
$(function(){
   $('a[rel*=anchor]').click(function() {
      var speed = 600;
      var href= $(this).attr("href");
      var target = $(href == "#" || href == "" ? 'html' : href);
      var position = target.offset().top;
		  var offset = 90;
			if(ww >= 768){
			}
			else {
				offset = 50;
			}
      $('body,html').animate({scrollTop:(position-offset)}, speed, 'swing');
      return false;
   });
});
function scrollActive(seelctor, offset) {
	user_scroll = $(window).scrollTop();
	
	if($(seelctor).length) {
		if(user_scroll > $(seelctor).offset().top - wh + offset) {
			$(seelctor).addClass('active');
		}
	}
}
function checkViewsizeAndOverflow() {
	if(ww >= 768){
		$("body").addClass("pc_view").removeClass("sp_view");
		current_view = 'pc';
	} else {
		$("body").addClass("sp_view").removeClass("pc_view");
		current_view = 'sp';
	}	
	if(wh >= 500){
		$("body").removeClass("overflow_menu");
	} else {
		$("body").addClass("overflow_menu");
	}
}
function getParam(name, url) {
  if (!url) url = window.location.href;
  name = name.replace(/[\[\]]/g, "\\$&");
  var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
      results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, " "));
}
