var projectIds = null;
var representatives = null;
var currentProject = null;
var results = null;

var projects = [
	"exp-11-pe-11-orden-del-dia-03-votacion-en-general",
	"exp-13-pe-08-votacion-en-general",
	"exp-16-jgm-11-orden-del-dia-01-votacon-en-general",
	"exp-1737-d-09-y-0574-d-10-od-197-vot-en-general",
	"exp-22-pe-09-y-otros-orden-del-dia-2005-vot-en-general",
	"exp-27-pe-08-orden-del-dia-1167-votacion-en-general",
	"exp-2843-d-06-y-otro-orden-del-dia-1479-vot-en-general",
	"exp-31-pe-09-votacion-en-general-y-particular",
	"exp-3306-d-10-orden-del-dia-1044-votacion-en-general",
	"exp-38-pe-08-orden-del-dia-1530-votacion-en-general",
	"exp-4029-d-09-y-otros-o-d-873-vot-en-general",
	"exp-7243-d-10-y-otros-orden-del-dia-2913-votacion-en-general",
	"expediente-01-pe-12-votacion-en-general",
	"expediente-04-pe-12-orden-del-dia-1458-votacion-en-general",
	"expediente-1-pe-10-y-otros-orden-del-dia-1868",
	"expediente-1-pe-11-orden-del-dia-09-votacion-en-general",
	"expediente-10-s-13-orden-del-dia-1905-votacion-en-general",
	"expediente-11-s-13-orden-del-dia-1907-votacion-en-general-y-particular",
	"expediente-118-s-12-orden-del-dia-1164-votacion-en-general",
	"expediente-12-s-13-orden-del-dia-1906-votacion-en-general-y-particular",
	"expediente-121-s-12-orden-del-dia-1308-votacion-en-general",
	"expediente-128-s-11-orden-del-dia-1812-votacion-en-general-y-particular",
	"expediente-15-jgm-12-orden-del-dia-1044-votacion-en-general-y-particular",
	"expediente-1943-d-12-y-otros-orden-del-dia-494-votacion-en-general-y-particular",
	"expediente-236-s-12-orden-del-dia-1867-votacion-en-general-y-particular",
	"expediente-24-pe-10-orden-del-dia-n-10-votacion-en-general",
	"expediente-26-s-12-orden-del-dia-192-votacion-en-general",
	"expediente-29-s-12-orden-del-dia-288-votacion-en-general-",
	"expediente-8-pe-11-orden-del-dia-07-votacion-en-general",
	"expediente-94-s-12-orden-del-dia-690-votacion-en-general"
];

function shuffle(array) {
    var counter = array.length, temp, index;

    // While there are elements in the array
    while (counter > 0) {
        // Pick a random index
        index = (Math.random() * counter--) | 0;

        // And swap the last element with it
        temp = array[counter];
        array[counter] = array[index];
        array[index] = temp;
    }

    return array;
}

function reset() {
	currentProject = null;
	results = {};
	projectIds = shuffle(projects.slice(0));
	$('#intro').css('display', 'block');
	$('#about').css('display', 'none');
	$('#voting').css('display', 'none');
	$('#results').css('display', 'none');
}

function loadRandomProject() {
	currentProject = null;
	if (projectIds.length == 0) {
		finish();
		return;
	}
	var id = projectIds.pop();
	$.getJSON('data/proyectos/' + id + '.json', function (data) {
		currentProject = data;
		$('#project').text(data.nombre);
		$('#summary').text(data.sumario);
		$('#date').text(data.fecha + ' - ' + data.asunto);
		$('#voting').fadeIn(100);
		var n = projects.length;
		var i = n - projectIds.length - 1;
		var p = Math.round(i * 100 / n);
		$('#progress-bar span').css('width', p + '%');
		$('#progress-status').text('Completado: ' + i + ' / ' + n);
	});
}

function vote(choice) {
	var voting = currentProject.votacion;
	if (!voting) return;
	if (choice) {
		voteHelper(voting.AFIRMATIVO, true);
		voteHelper(voting.NEGATIVO, false);
		voteHelper(voting.ABSTENCION, false);
	} else {
		voteHelper(voting.AFIRMATIVO, false);
		voteHelper(voting.NEGATIVO, true);
		voteHelper(voting.ABSTENCION, false);
	}
}

function voteHelper(keys, coinciding) {
	if (!keys) return;
	for (var i = 0; i < keys.length; i++) {
		var k = keys[i];
		if (!(results[k])) {
			results[k] = $.extend({
				coincidences: 0,
				discrepancies: 0,
			}, representatives[k]);
		}
		if (coinciding) {
			results[k].coincidences += 1;
		} else {
			results[k].discrepancies += 1;
		}
	}
}

function printResults(field) {
	var rows = $('#rows');
	rows.empty();
	var tuples = sortResults(field);
	for (var i = 0; i < tuples.length; i++) {
		var r = tuples[i];
		var tr = document.createElement('tr');
		$(tr).attr('id', i);

		var td = document.createElement('td');
		var span = document.createElement('span'); 
		$(span).text(r.nombre);
		$(td).append(span);
		$(td).append(document.createElement('br'));
		var info = document.createElement('span'); 
		$(info).text(r.bloque + ' (' + r.distrito + ')');
		$(info).addClass('shady');
		$(td).append(info);
		tr.appendChild(td);

		printResultsHelper(tr, r.coincidences);
		printResultsHelper(tr, r.discrepancies);
		printResultsHelper(tr, r.coincidences - r.discrepancies);
		rows.append(tr);
	}
}

function printResultsHelper(tr, text) {
	var td = document.createElement('td');
	$(td).text(text);
	$(td).addClass('center');
	tr.appendChild(td);
}

function sortResults(field) {
	var tuples = new Array();
	for (i in results) {
		var r = results[i];
		r.id = i;
		r.difference = r.coincidences - r.discrepancies;
		tuples.push(r);
	}
	var sort = (field == 'discrepancies' ? 1 : -1);
	tuples.sort(function (a, b) { return sort * (a[field] - b[field]); });
	return tuples;
}

function finish() {
	printResults('difference');
	$('#voting').stop(true);
	$('#voting').fadeOut(200, function () {
		$('#results').fadeIn(100);
	});
}

$(document).ready(function () {
	$('#vote-aye').click(function () {
		if (!currentProject) return;
		vote(true);
		$('#voting').fadeOut(200, loadRandomProject);
	});
	$('#vote-nay').click(function () {
		if (!currentProject) return;
		vote(false);
		$('#voting').fadeOut(200, loadRandomProject);
	});
	$('#vote-abs').click(function () {
		if (!currentProject) return;
		$('#voting').fadeOut(200, loadRandomProject);
	});

	$('#facebook').click(function () {
		window.open('https://www.facebook.com/sharer/sharer.php?u='
			+ encodeURIComponent(location.href),
			'facebook-share-dialog', 'width=626,height=436');
	});
	$('#twitter').click(function () {
		var tweet = '\u00bfNo sab\u00e9s a qui\u00e9n votar? '
			+ 'Prob\u00e1 este juego para elegir legisladores '
			+ 'que votan como vos: ';
		window.open('http://twitter.com/intent/tweet?text='
			+ encodeURIComponent(tweet) + '&url='
			+ encodeURIComponent(url)
			+ '&hashtags=opengov,elegilegi',
			'twitter-share-dialog', 'width=550,height=420');
	});
	$('#googleplus').click(function () {
		window.open('https://plus.google.com/share?url='
			+ encodeURIComponent(location.href),
			'google-share-dialog', 'width=600,height=600');
	});

	$.getJSON('data/legisladores.json', function (data) {
		representatives = data;
		$('#start').click(function () {
			$('#intro').fadeOut(200, loadRandomProject);
		});
	});

	$('#coincidences').click(function () { printResults('coincidences'); });
	$('#discrepancies').click(function () { printResults('discrepancies'); });
	$('#difference').click(function () { printResults('difference'); });

	$('#link').click(function () {
		if (!currentProject) return;
		window.open(currentProject.url, '_blank');
	});
	$('#info').click(function () { $('#about').slideToggle(500); });
	$('#back').click(function () { $('#about').slideToggle(500); });
	$('#reset').click(reset);
	reset();
});
