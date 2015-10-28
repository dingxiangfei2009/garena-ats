require

namespace :db do
	desc "populate data"
	task :populate => :environment do
		require 'models/question_type'
		require 'models/field'
		# INSERT INTO `garena_ats_development`.`question_types` (`id`, `name`) VALUES ('1', 'mas');
		# INSERT INTO `garena_ats_development`.`question_types` (`id`, `name`) VALUES ('2', 'sbc');
		# INSERT INTO `garena_ats_development`.`question_types` (`id`, `name`) VALUES ('3', 'sbt');
		# INSERT INTO `garena_ats_development`.`question_types` (`id`, `name`) VALUES ('4', 'fib');
		QuestionType.create name: mas
		QuestionType.create name: sbc
		QuestionType.create name: sbt
		QuestionType.create name: fib
		# INSERT INTO `garena_ats_development`.`fields` (`id`, `name`, `token`) VALUES ('1', 'Android', 'and');
		# INSERT INTO `garena_ats_development`.`fields` (`id`, `name`, `token`) VALUES ('2', 'Algorithms and Data Structures', 'adt');
		# INSERT INTO `garena_ats_development`.`fields` (`id`, `name`, `token`) VALUES ('3', 'iOS', 'ios');
		# INSERT INTO `garena_ats_development`.`fields` (`id`, `name`, `token`) VALUES ('4', 'Networks', 'net');
		# INSERT INTO `garena_ats_development`.`fields` (`id`, `name`, `token`) VALUES ('5', 'Operating Systems', 'ops');
		# INSERT INTO `garena_ats_development`.`fields` (`id`, `name`, `token`) VALUES ('6', 'Security', 'sec');
		# INSERT INTO `garena_ats_development`.`fields` (`id`, `name`, `token`) VALUES ('7', 'Web Development', 'web');
		Field.create name: 'Android', token: 'and'
		Field.create name: 'Algorithms and Data Structures', token: 'adt'
		Field.create name: 'iOS', token: 'ios'
		Field.create name: 'Networks', token: 'net'
		Field.create name: 'Operating Systems', token: 'ops'
		Field.create name: 'Security', token: 'sec'
		Field.create name: 'Web Development', token: 'web'
	end
end