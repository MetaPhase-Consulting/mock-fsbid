exports.up = function(knex) {
  return knex.schema
    .alterTable('employees', function(table) {
      table.string('first_name');
      table.string('last_name');
      table.string('middle_name')
      table.string('prefix_name')
      table.timestamp('dob')
      table.specificType('per_seq_num', 'serial').unique()
      table.integer('currentassignment')

      table.dropColumn('fullname')
    })
    .createTable('assignments', function(table) {
      table.increments('asg_seq_num').primary()
      table.integer('pos_seq_num')
      table.integer('emp_seq_nbr')
      table.integer('asg_create_id')
      table.timestamp('asg_create_date').default(knex.fn.now())
      table.integer('asg_update_id')
      table.timestamp('asg_update_date')
      table.integer('asgd_revision_num')
      table.string('asgs_code') // AP, CP, EF

      table.foreign('pos_seq_num').references('positions.pos_seq_num')
      table.foreign('emp_seq_nbr').references('employees.per_seq_num')
    })
    .createTable('classifications', function(table) {
      table.increments('td_id').primary()
      table.string('tp_code')
      table.string('tp_descr_txt')
      table.string('disabled_ind')
    })
    .createTable('employees_classifications', function(table) {
      table.integer('td_id')
      table.integer('perdet_seq_num')

      table.foreign('td_id').references('classifications.td_id')
      table.foreign('perdet_seq_num').references('employees.perdet_seq_num')
    })
    .alterTable('employees', function(table) {
      table.foreign('currentassignment').references('assignments.asg_seq_num')
    });
};
exports.down = function(knex) {
  return knex.schema
    .alterTable('employees', function(table) {
      table.string('fullname');
      
      table.dropColumn('first_name')
      table.dropColumn('last_name')
      table.dropColumn('middle_name')
      table.dropColumn('prefix_name')
      table.dropColumn('dob')
      table.dropColumn('per_seq_num')
      table.dropColumn('currentassignment')
    })
    .dropTable('assignments')
    .dropTable('employees_classifications')
    .dropTable('classifications')
};