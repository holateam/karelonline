
function SidebarSlider(initialTab) {
	this.active = null;
	this.showTab(initialTab);
	if (this.width==undefined){
		this.width = initialTab.width();
	}
}

SidebarSlider.prototype.showTab = function(tab) {
	console.log(tab, this.active);
	if (tab != this.active) {
		if (this.active) {
			this.active.css('left', this.width);
		} else {
			this.width = tab.width();
		}
		this.active = tab;
		tab.css('left', 0);
		/*
		$('.tab').hide( 'slide', {}, 1000 );
		tab.show('slide',1000);
		this.active = tab;
		*/
	}
};