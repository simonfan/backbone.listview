define(['backbone'], function(Backbone) {

	var ListView = Backbone.ListView = Backbone.View.extend({
		initialize: function(options) {
			/**
			 * Options:
			 *	- el: html list
			 *	- collection
			 *	- itemData: function that intercepts the model rendering
			 *	- itemTemplate: template function used to render the book thumbnail.
			 *	- itemSelector: function that returns a selector used to find a specific item.
			 */

			_.bindAll(this, 'add','reset','remove','moment','retrieveElement');

			this.itemData = options.itemData || this.itemData;
			this.itemTemplate = options.itemTemplate || this.itemTemplate;
			this.itemSelector = options.itemSelector || this.itemSelector;

			// force moments to be an object
			var moments = options.moments || {};
			this.moments = _.defaults(moments, this.moments);

			// listen to events on the collection
			this.listenTo(this.collection, 'add', this.add)
				.listenTo(this.collection, 'reset', this.reset)
				.listenTo(this.collection, 'remove', this.remove);

			// start things up.
			this.reset(this.collection, this.collection.models);
		},

		/**
		 * Wraps the moment methods with promise-compliant
		 */
		moment: function(name, args) {
			var moment = this[ name ];

			return typeof moment === 'function' ? $.when( moment.apply(this, args) ) : $.when( true );
		},

		/**
		 * moments
		 */
		beforeAdd: function(model, $el) { $el.css('opacity', 0); },
		afterAdd: function(model, $el) { return $el.animate({ opacity: 1 }); },
		beforeRemove: function(model, $el) { return $el.animate({ opacity: 0 }); },
		afterRemove: function(model) {},
		beforeReset: function(collection, $el) {},
		afterReset: function(collection, $el) {},

		/**
		 * When models are added on the collection, 
		 * add them here in the list.
		 */
		add: function(model) {
				// get the data for the template rendering
				// if there is an itemData function set, use it. Otherwise just use the model's attributes.
			var itemData = (typeof this.itemData === 'function') ? this.itemData(model) : model.attributes,
				// promise based render thumbnail
				renderThumb = $.when(itemData).then(this.itemTemplate),
				_this = this;

			// wait for the thumbnail to be rendered to continue.
			renderThumb.then(function(thumbHtml) {

				var $thumb = $(thumbHtml);

				_this.moment('beforeAdd', [model, $thumb])
					.then(function() {
						// append
						$thumb.appendTo(_this.$el);

						// run after
						_this.moment('afterAdd', [model, $thumb]);
					});
			});
		},

		// handles reset events on the collection
		reset: function(collection, models) {

			var _this = this;

			this.moment('beforeReset', [collection, this.$el])
				.then(function() {
					// remove all items from the list.
					_this.$el.html('');

					// run after
					_this.moment('afterReset',[collection]);
				});
			
			// add each of the models to the list.
			_.each(collection.models, this.add);
		},

		/**
		 * Handles remove events on the collection
		 */
		remove: function(model) {
			// find the item to be removed
			var $item = this.retrieveElement(model),
				_this = this;

			this.moment('beforeRemove', [model, $item])
				.then(function() {
					$item.remove();

					_this.moment('afterRemove', [model]);
				});
		},

		/**
		 * method returns data to be used in the template.
		 */
		itemData: function(model) {
			return model.attributes;
		},

		/**
		 * The templating function
		 */
		itemTemplate: function(data) {
			return '<li id="'+ data.id +'"> Item id: '+ data.id +'</li>';
		},

		/**
		 * method returns a selector used to find the html representation of a given model.
		 * within the $el of this list view.
		 */
		itemSelector: function(model) {
			return '#' + model.id;
		},



		/**
		 * Method that retrieves the $el for a given backbone model.
		 * Uses the 'itemSelector' method.
		 */
		retrieveElement: function(model) {
			var selector = this.itemSelector(model),
				$el = this.$el.find(selector);

			return $el;
		},

	});

	return ListView;
});