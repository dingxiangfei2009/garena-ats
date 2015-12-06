require 'test_helper'

class AuthControllerTest < ActionController::TestCase
  test "should get auth" do
    get :auth
    assert_response :success
  end

  test "should get fail" do
    get :fail
    assert_response :success
  end

end
