<?php
<<<<<<< HEAD:database/seeders/SettingSeeder.php

namespace Database\Seeders;

=======
namespace Database\Seeders;
>>>>>>> dev:database/seeders/SettingsSeeder.php
use Illuminate\Database\Seeder;

class SettingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {

        $DEFAULTS = [
            "e5nPresentationSignup" => "0",
        ];
        foreach ($DEFAULTS as $key => &$value) {
            $setting = new \App\Setting();
            $setting->key = $key;
            $setting->value = $value;
            $setting->save();
        }

    }
}