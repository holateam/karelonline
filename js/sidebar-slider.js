
function SidebarSlider(initialTab) {
	this.active = null;
	this.showTab(initialTab);
}

SidebarSlider.prototype.showTab = function(tab) {
	console.log(tab, this.active);
	if (tab != this.active) {
		$('.tab').css({
			'opacity': 0,
			'z-index': 1
		});
		tab.css({
			'opacity': 1,
			'z-index': 2
		});
		this.active = tab;
	}
};