<?php

namespace App\Helpers;

enum PermissionType: string
{
    case Organiser = "ORG"; // progranszervező
    case Aadmin = "ADM"; // E5N admin szervező
    case Teacher = "TCH"; // tanár
    case Student = "STD"; // diák
    case Operator = "OPT"; // zoland
    case TeacherAdmin = "TAD"; //bara
}
