if (mouse_check_button_pressed(mb_left)) {
	if (position_meeting(mouse_x, mouse_y, self)) {
		focused = true;
	} else {
		focused = false;
	}
}

if (!focused) {
	image_blend = c_grey;
} else {
	image_blend = c_green;
}