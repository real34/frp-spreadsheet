import Kefir from 'kefir';
import {EstimatedTask} from './ValueObjects';

function htmlToTask(htmlRow) {
	return new EstimatedTask(
		htmlRow.querySelector('[name=label]').value,
		htmlRow.querySelector('[name=min]').value,
		htmlRow.querySelector('[name=max]').value
	);
}

function appendTaskRowTo(tbody) {
	return function() {
		let row = document.createElement('tr');
		row.innerHTML = `
			<td><input type="text" name="label" placeholder="Installer npm"></td>
			<td><input type="text" name="min" placeholder="1" size="3"></td>
			<td><input type="text" name="max" placeholder="2" size="3"></td>
		`;
		tbody.appendChild(row);
	}
}

function pluck(key) {
	return function(arr) {
		return arr.map(elt => elt[key])
	}
}
let getMin = pluck('min');
let getMax = pluck('max');

function sum(estimations) {
	console.debug(estimations);
	return estimations.reduce((a, b) => a + b.value, 0);
}

function calculeTotaux(tasks, taux) {
	console.debug(tasks, getMin(tasks));
	const min = getMin(tasks).map(sum);
	const max = getMax(tasks).map(sum);
	return {
		min: min*taux,
		max: max*taux
	}
}

function init(tasksTable, gestionProjetElement, totalElement) {
	const estimatedTasks = Kefir.fromEvents(tasksTable, 'change')
		.map(e => tasksTable.querySelectorAll('tbody tr'))
		.map(rows => [...rows].map(htmlToTask).filter(task => task.isEstimated()))
		.toProperty(function() { return []; });

	const newRowNeeded = estimatedTasks
		.map(tasks => tasks.length)
		.filter(validTasksCount => validTasksCount >= tasksTable.querySelectorAll('tbody tr').length);

	const tasksMinSubtotal = estimatedTasks.map(pluck('min')).map(sum);
	const tasksMaxSubtotal = estimatedTasks.map(pluck('max')).map(sum);
	const gestionDeProjet = Kefir
		.combine(
			[tasksMinSubtotal, tasksMaxSubtotal],
			(min, max) => new EstimatedTask('Gestion de projet', min * 0.2, max * 0.2)
		)
		.filter(task => task.isEstimated());

	const tauxHoraire = Kefir.constant(100);
	const total = Kefir.combine(
		[estimatedTasks, gestionDeProjet, tauxHoraire],
		(tasks, project, taux) => calculeTotaux(tasks.push(project), taux)
	).log('total');

	newRowNeeded.onValue(appendTaskRowTo(tasksTable.querySelector('tbody')));
	gestionDeProjet.onValue(task => {
		gestionProjetElement.innerHTML = `${task} : ${task.min} - ${task.max}`
	});
}

export default {
	init: init
}