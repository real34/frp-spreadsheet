function init(tasksTable, gestionProjet) {
	tasksTable.addEventListener('change', e => console.log(e));
	gestionProjet.innerHTML = '0';
}

export default {
	init: init
}