/**
 * Initial database migration
 */
exports.up = function(knex) {
  return Promise.all([
    // Create uploads table
    knex.schema.createTable('uploads', (table) => {
      table.string('id').primary();
      table.string('original_filename').notNullable();
      table.string('file_path').notNullable();
      table.string('facility_type').notNullable();
      table.datetime('uploaded_at').notNullable();
    }),
    
    // Create facilities table
    knex.schema.createTable('facilities', (table) => {
      table.string('id').primary();
      table.string('upload_id').notNullable().references('id').inTable('uploads');
      table.string('name').notNullable();
      table.text('data').notNullable();
      table.string('facility_type').notNullable();
    })
  ]);
};

exports.down = function(knex) {
  return Promise.all([
    knex.schema.dropTable('facilities'),
    knex.schema.dropTable('uploads')
  ]);
};