define(['backbone.listview','backbone','jquery'], function(ListView, Backbone, $) {

	var collection = new Backbone.Collection([
		{ id: 1, name: 'apple' },
		{ id: 2, name: 'banana' },
		{ id: 3, name: 'pineapple' },
	]);

	var View = ListView.extend({
		itemData: function(model) {
			var defer = $.Deferred(),
				data = model.attributes;

			setTimeout(_.partial(defer.resolve, data), 1000);

			return defer;
		},

		itemTemplate: function(data) {
			return '<li> id: ' + data.id +' - ' + data.name +'</li>';
		}
	});


	var view = new View({
		el: $('#list'),
		collection: collection,
	});

});