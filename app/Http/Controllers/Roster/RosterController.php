<?php

namespace App\Http\Controllers\Roster;

use App\Http\Controllers\Controller;
use App\Models\Roster\RosterMember;
use App\Models\Roster\SoloCertification;
use App\Models\Users\User;
use App\Notifications\Roster\RemovedFromRoster;
use App\Notifications\Roster\RosterStatusChanged;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Validator;

class RosterController extends Controller
{
    public function publicRoster()
    {
        //Get roster
        $roster = RosterMember::where('certification', '!=', 'not_certified')->get();

        //Return view
        return view('roster', compact('roster'));
    }

    public function admin()
    {
        //Get the roster
        $roster = RosterMember::all();

        //Return view
        return view('admin.training.roster.index', compact('roster'));
    }

    public function addRosterMemberPost(Request $request)
    {
        //Define validator messages
        $messages = [
            'cid.required' => 'A controller CID is required.',
            'cid.min' => 'CIDs are a minimum of 8 characters.',
            'cid.integer' => 'CIDs must be an integer.',
            'certification.required' => 'Certification required.',
            'active.required' => 'Active required.',
            'date_certified.required' => 'Certification date required.'
        ];

        //Validate
        $validator = Validator::make($request->all(), [
            'cid' => 'required|integer|min:8',
            'certification' => 'required',
            'active' => 'required',
            'date_certified' => 'required'
        ], $messages);

        //If there is already someone with this CID...
        $validator->after(function ($validator) use($request) {
            if (RosterMember::where('cid', $request->get('cid'))->first()) {
                $validator->errors()->add('cid', 'CID already on roster');
            }
        });

        //Redirect if it fails
        if ($validator->fails()) {
            return redirect()->route('training.admin.roster', ['addRosterMemberModal' => 1])->withInput()->withErrors($validator, 'addRosterMemberErrors');
        }

        //Create the object
        $rosterMember = new RosterMember();

        //Assign values
        $rosterMember->cid = $request->get('cid');
        $rosterMember->certification = $request->get('certification');
        $rosterMember->active = ($request->get('active') === 'true');
        $rosterMember->remarks = $request->get('remarks');

        //Date certified
        if ($request->get('certification') == 'certified') {
            $rosterMember->date_certified = $request->get('date_certified');
        }

        //User associated
        $user = User::whereId($request->get('cid'))->first();
        if ($user) {
            $rosterMember->user_id = $user->id;
        } else {
            $rosterMember->user_id = 2;
        }

        //Save
        $rosterMember->save();

        //Notify
        if ($user) {
            Notification::send($user, new RosterStatusChanged($rosterMember));
        }

        //Redirect
        return view('admin.training.roster.controller', compact('rosterMember'));
    }

    public function viewRosterMember($cid)
    {
        //Get roster member
        $rosterMember = RosterMember::where('cid', $cid)->firstOrFail();

        //Return view
        return view('admin.training.roster.controller', compact('rosterMember'));
    }

    public function removeRosterMember($cid)
    {
        //Get roster member
        $rosterMember = RosterMember::where('cid', $cid)->firstOrFail();
        $user = $rosterMember->user;

        //Delete and its dependencies
        foreach (SoloCertification::where('roster_member_id', $rosterMember->id)->get() as $cert) {
            $cert->delete();
        }
        $rosterMember->delete();

        //Notify user
        Notification::send($user, new RemovedFromRoster($user));

        //Return view
        return redirect()->route('training.admin.roster')->with('info', 'Roster member removed');
    }


    public function editRosterMemberPost($cid, Request $request)
    {
        //Get roster member
        $rosterMember = RosterMember::where('cid', $cid)->firstOrFail();

        //Define validator messages
        $messages = [
            'certification.required' => 'Certification required.',
            'active.required' => 'Active required.',
            'date_certified.required' => 'Certification date required.'
        ];

        //Validate
        $validator = Validator::make($request->all(), [
            'certification' => 'required',
            'active' => 'required',
            'date_certified' => 'required'
        ], $messages);

        //Redirect if it fails
        if ($validator->fails()) {
            return redirect()->route('training.admin.roster.viewcontroller', ['editRosterMemberModal' => 1], compact('rosterMember'))->withInput()->withErrors($validator, 'editRosterMemberErrors');
        }

        //Assign values
        $rosterMember->certification = $request->get('certification');
        $rosterMember->active = ($request->get('active') === 'true');
        $rosterMember->remarks = $request->get('remarks');

        //Date certified
        if ($request->get('certification') == 'certified') {
            $rosterMember->date_certified = $request->get('date_certified');
        }

        //Notify
        if ($rosterMember->isDirty('certification') || $rosterMember->isDirty('active')) {
            $user = User::whereId($request->get('cid'))->first();
            if ($user) {
                Notification::send($user, new RosterStatusChanged($rosterMember));
            }
        }

        //Save
        $rosterMember->save();

        //Redirect
        return view('admin.training.roster.controller', compact('rosterMember'))->with('success', 'Edited!');
    }

}
