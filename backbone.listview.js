define(['backbone'], function(Backbone) {

	var ListView = Backbone.ListView = Backbone.View.extend({
		initialize: function(options) {
			/**
			 * Options:
			 *	- el: html list
			 *	- collection
			 *	- itemTemplate: template function used to render the book thumbnail.
			 *	- itemData: function that intercepts the model rendering
			 */

			_.bindAll(this, '_add','_reset');

			this.itemTemplate = options.itemTemplate;
			this.itemData = options.itemData;

			// listen to events on the collection
			this.listenTo(this.collection, 'add', this._add)
				.listenTo(this.collection, 'reset', this._reset);
		},

		/**
		 * When models are added on the collection, 
		 * add them here in the list.
		 */
		_add: function(model) {
				// get the data for the template rendering
				// if there is an itemData function set, use it. Otherwise just use the model's attributes.
			var itemData = (typeof this.itemData === 'function') ? this.itemData(model) : model.attributes,
				// render thumbnail
				thumb = this.itemTemplate(itemData);

			// append the render result to the list.
			$(thumb).appendTo(this.$el);

			// trigger the 'add' event on the view, so that outer code may build stuff on the thumbnail.
			this.trigger('add', thumb);
		},

		// handles reset events on the collection
		_reset: function(collection, models) {
			// remove all items from the list.
			this.$el.html('');
			
			// add each of the models to the list.
			_.each(collection.models, this._add);
		},
	});

	return ListView;
});