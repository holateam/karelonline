
function SidebarSlider(initialTab) {
	this.active = null;
	this.showTab(initialTab);
}

SidebarSlider.prototype.showTab = function(tab) {
	console.log(tab, this.active);
	if (tab != this.active) {
		$('.tab').hide( 'slide', {}, 1000 );
		tab.show('slide',1000);
		this.active = tab;
	}
};