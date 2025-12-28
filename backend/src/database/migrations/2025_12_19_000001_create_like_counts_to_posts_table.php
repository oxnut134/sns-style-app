<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateLikeCountsToPostsTable extends Migration
{
    public function up()
    {
        Schema::table('posts', function (Blueprint $table) {
            //$table->string('uid')->unique()->nullable()->after('message');
            $table->integer('totalMyLikeCount')->default(0)->after('message');
            $table->integer('firstMyLikeCount')->default(0)->after('totalMyLikeCount');
            $table->integer('lastMyLikeCount')->default(0)->after('firstMyLikeCount');
            $table->boolean('isLikeClicked')->default(false)->after('lastMyLikeCount');
        });
    }

    public function down()
    {
        Schema::table('posts', function (Blueprint $table) {
            $table->dropColumn(['totalMyLikeCount', 'firstMyLikeCount', 'lastMyLikeCount', 'isLikeClicked']);
        });
    }
}
