<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class UserController extends Controller
{
    /**
     * Показать список всех пользователей
     */
    public function index()
    {
        $users = User::all();

        return Inertia::render('Admin/Users/Index', [
            'users' => $users
        ]);
    }

    /**
     * Показать форму редактирования пользователя
     */
    public function edit(User $user)
    {
        return Inertia::render('Admin/Users/Edit', [
            'user' => $user
        ]);
    }

    /**
     * Обновить данные пользователя
     */
    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => [
                'required',
                'string',
                'email',
                'max:255',
                Rule::unique('users')->ignore($user->id),
            ],
            'password' => ['nullable', 'string', 'min:8'],
            'is_admin' => ['boolean'],
            'markup_percent' => ['required', 'numeric', 'min:0', 'max:100'],
        ]);

        // Обновляем только если новый пароль предоставлен
        if (isset($validated['password']) && $validated['password']) {
            $validated['password'] = Hash::make($validated['password']);
        } else {
            unset($validated['password']);
        }

        $user->update($validated);

        return redirect()->route('admin.users.index')->with('message', 'Пользователь успешно обновлен');
    }

    /**
     * Удалить пользователя
     */
    public function destroy(User $user)
    {
        $user->delete();

        return redirect()->route('admin.users.index')->with('message', 'Пользователь успешно удален');
    }

    /**
     * Обновить наценку для пользователя
     */
    public function updateMarkup(Request $request, User $user)
    {
        $validated = $request->validate([
            'markup_percent' => ['required', 'numeric', 'min:0', 'max:100'],
        ]);

        $user->update($validated);

        return redirect()->back()->with('message', 'Наценка пользователя успешно обновлена');
    }
}
